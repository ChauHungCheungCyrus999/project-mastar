export function initUser() {
  const user = {
    _id: "65edbf9c5f5fc38e6b0aec80",

    firstName: 'Tiffany',
    lastName: 'Chu',
    gender: 'Female',

    email: 'bubbleschu@hotmail.com.hk',
    phone: '+852 12345678',

    organization: 'Sanfield (Management) Limited',
    department: 'IT',
    jobTitle: 'IT Officer',

    password: '$2b$10$dPO8ohjIbEnmoJD//8Mz6uy5gBhlBTTOdHxWIboo76U4jv3lHrdly',
    
    createdDate: '2023-11-22',
    updatedDate: '2023-11-23',

    // project only
    role: 'Project Manager',
    permissions: ['editProject', 'deleteProject', 'readAuditLog']
  };

  return user;
}
