import bcrypt from 'bcrypt';

async function hashPassword(password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log('Hashed password:', hashedPassword);
  return hashedPassword;
}

// Hash the password "Admin1234"
hashPassword('Admin1234');