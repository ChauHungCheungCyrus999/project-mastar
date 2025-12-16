export function initRoles() {
  const roles = [
    {
      _id: 1,
      name: 'Administrator',
      description: 'Has all permissions',
      permissions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12','13', '14', '15', '16', '17', '18', '19', '20', '21'],
      createdBy: '65edbf9c5f5fc38e6b0aec80',
      createdDate: '2024-01-29',
      updatedBy: '65edbf9c5f5fc38e6b0aec80',
      updatedDate: '2024-01-30',
    },
    {
      _id: 2,
      name: 'Project Manager',
      description: 'Has permissions related to project management',
      permissions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12','13', '14', '15', '16', '17', '18', '19', '20'],
      createdBy: '65edbf9c5f5fc38e6b0aec80',
      createdDate: '2024-01-29',
      updatedBy: '65edbf9c5f5fc38e6b0aec80',
      updatedDate: '2024-01-30',
    },
    {
      _id: 3,
      name: 'Team Member',
      description: 'Has permissions for team-related tasks',
      permissions: ['1', '2', '3', '4', '12','13', '14', '15', '16', '17', '18', '19'],
      createdBy: '65edbf9c5f5fc38e6b0aec80',
      createdDate: '2024-01-29',
      updatedBy: '65edbf9c5f5fc38e6b0aec80',
      updatedDate: '2024-01-30',
    },
    {
      _id: 4,
      name: 'Stakeholder',
      description: 'Has limited permissions for project information',
      permissions: ['1', '2', '3', '4', '7', '8', '9', '10', '11', '12','13', '14', '15', '16', '19', '20'],
      createdBy: '65edbf9c5f5fc38e6b0aec80',
      createdDate: '2024-01-29',
      updatedBy: '65edbf9c5f5fc38e6b0aec80',
      updatedDate: '2024-01-30',
    },
  ];

  return roles;
}
