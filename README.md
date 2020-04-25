# authentication
Different level of authentication method with different branches

Level 1:  username and password only.
          Connected to DB and store plain username and password.

Level 2:  Database Encryption for username and password.
          Connected to DB and store encrypted username and password.

Level 3:  Hashing Password using MD5.
          Connected to DB and store encrypted username and hashed password.

Level 4:  Salting and Hashing Passwords with bcrypt.
          Connected to DB and store encrypted username and hashed password using 
          Salting and Hashing Passwords with bcrypt.
