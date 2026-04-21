let connection = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/*exports.userList = function (req, res) {
    connection.query('SELECT * FROM users', function (error, result) {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: error });
        }

        return res.status(200).json(result);
    });
};
*/
// REGISTER = uniquement patient
// crée patient + user lié au patient
exports.registeruser = function (req, res) {
    let {
        name,
        email,
        password,
        first_name,
        last_name,
        date_of_birth,
        phone
    } = req.body;

    let patientCode = 'PAT' + Date.now();

    if (!name || !email || !password || !first_name || !last_name) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        function (error, users) {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: error });
            }

            if (users.length > 0) {
                return res.status(409).json({ message: 'Email already exists' });
            }

            let patient = {
                patient_code: patientCode,
                first_name: first_name,
                last_name: last_name,
                date_of_birth: date_of_birth,
                phone: phone
            };

            connection.query(
                'INSERT INTO patients SET ?',
                patient,
                function (error, patientResult) {
                    if (error) {
                        console.log(error);
                        return res.status(500).json({ message: error });
                    }

                    let patient_id = patientResult.insertId;

                    bcrypt.hash(password, 10, function (err, hashedPassword) {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ message: err });
                        }

                        let user = {
                            name: name,
                            email: email,
                            password: hashedPassword,
                            role: 'patient',
                            patient_id: patient_id
                        };

                        connection.query(
                            'INSERT INTO users SET ?',
                            user,
                            function (error, userResult) {
                                if (error) {
                                    console.log(error);
                                    return res.status(500).json({ message: error });
                                }

                                return res.status(201).json({
                                    message: 'Patient registered successfully',
                                    user_id: userResult.insertId,
                                    patient_id: patient_id
                                });
                            }
                        );
                    });
                }
            );
        }
    );
};

exports.registerDoctor = function (req, res) {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        function (error, users) {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: error });
            }

            if (users.length > 0) {
                return res.status(409).json({ message: 'Email already exists' });
            }

            bcrypt.hash(password, 10, function (err, hashedPassword) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: err });
                }

                let user = {
                    name: name,
                    email: email,
                    password: hashedPassword,
                    role: 'doctor'
                };

                connection.query(
                    'INSERT INTO users SET ?',
                    user,
                    function (error, result) {
                        if (error) {
                            console.log(error);
                            return res.status(500).json({ message: error });
                        }

                        return res.status(201).json({
                            message: 'Doctor created successfully',
                            user_id: result.insertId
                        });
                    }
                );
            });
        }
    );
};

exports.login = function (req, res) {
    let email = req.body.email;
    let password = req.body.password;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        function (error, result) {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: error });
            }

            if (result.length === 0) {
                return res.status(401).json({ message: 'User not found' });
            }

            let user = result[0];

            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: err });
                }

                if (!isMatch) {
                    return res.status(401).json({ message: 'Wrong password' });
                }

                let token = jwt.sign(
                    { id: user.id, role: user.role },
                    'secretkey',
                    { expiresIn: '1h' }
                );

                return res.status(200).json({
                    message: 'success',
                    token: token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        patient_id: user.patient_id || null
                    }
                });
            });
        }
    );
};

exports.verifyToken = function (req, res, next) {
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, 'secretkey', function (err, decoded) {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = decoded;
        next();
    });
};

exports.me = function (req, res) {
    let userId = req.user.id;

    connection.query(
        'SELECT id, name, email, role, patient_id FROM users WHERE id = ?',
        [userId],
        function (error, result) {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: error });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json({
                user: result[0]
            });
        }
    );
};

exports.getRequests = function (req, res) {
    let role = req.user.role;
    let userId = req.user.id;

    connection.query(
        'SELECT * FROM users WHERE id = ?',
        [userId],
        function (error, userResult) {

            if (error) {
                console.log(error);
                return res.status(500).json({ message: error });
            }

            if (userResult.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            let user = userResult[0];

            // CAS DOCTOR
            if (role === 'doctor') {
    connection.query(
        `SELECT pr.*, 
                p.first_name, p.last_name,
                u.name as doctor_name,
                et.name as exam_name
         FROM prescription_requests pr
         JOIN patients p ON pr.patient_id = p.id
         JOIN users u ON pr.doctor_id = u.id
         JOIN exam_types et ON pr.exam_type_id = et.id`,
        function (error, result) {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: error });
            }

            return res.status(200).json(result);
        }
    );
}

            // CAS PATIENT
            else {
                if (!user.patient_id) {
                    return res.status(200).json([]);
                }

                connection.query(
  `SELECT pr.*, 
          p.first_name, p.last_name,
          u.name as doctor_name,
          et.name as exam_name
   FROM prescription_requests pr
   JOIN patients p ON pr.patient_id = p.id
   JOIN users u ON pr.doctor_id = u.id
   JOIN exam_types et ON pr.exam_type_id = et.id
   WHERE pr.patient_id = ?`,
  [user.patient_id],
  function (error, result) {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }

    return res.status(200).json(result);
  }
);
            }
        }
    );
};
exports.createRequest = function (req, res) {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Only doctors can create requests' });
    }

    let {
        patient_id,
        exam_type_id,
        clinical_information,
        urgency_level
    } = req.body;

    if (!patient_id || !exam_type_id || !urgency_level) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    let request = {
        patient_id: patient_id,
        doctor_id: req.user.id,
        exam_type_id: exam_type_id,
        clinical_information: clinical_information,
        urgency_level: urgency_level,
        status: 'pending'
    };

    connection.query(
        'INSERT INTO prescription_requests SET ?',
        request,
        function (error, result) {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: error });
            }

            return res.status(201).json({
                message: 'request created',
                request_id: result.insertId
            });
        }
    );
};