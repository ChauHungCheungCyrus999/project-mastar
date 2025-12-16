export function initAuditLogs() {
  const auditLogs = [
    {
      _id: 1,
      action: 'Read',
      timestamp: '2024-03-13T15:28:50.941+00:00',
      ipAddress: '::1',
      requestUrl: '/api/audit-logs',
      responseStatus: '200'
    },
    {
      _id: 2,
      action: 'Read',
      timestamp: '2024-03-13T15:28:50.941+00:00',
      ipAddress: '::1',
      requestUrl: '/api/audit-logs',
      responseStatus: '200'
    },
    {
      _id: 3,
      action: 'Read',
      timestamp: '2024-03-13T15:28:50.941+00:00',
      ipAddress: '::1',
      requestUrl: '/api/audit-logs',
      responseStatus: '200'
    },
    {
      _id: "660bfd5f9fdb3271d1f38c12",
      action: "Delete",
      timestamp: "2024-04-02T20:43:11.609+08:00",
      ipAddress: "::1",
      requestUrl: "/api/project/657c52b9c0beea14c87a81ac",
      requestData: {
        _id: "657c52b9c0beea14c87a81ac",
        title: "Project 1",
        description: "<p><strong>Web App Development</strong></p>",
        teamMembers: [
          {
            _id : "65edbf9c5f5fc38e6b0aec80",
            role : "Project Manager",
            name : "Tiffany Chu"
          },
          {
            _id : "65f55a9bf14fff03ba585f3b",
            role : "Team Member",
            name : "振 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3c",
            role : "Team Member",
            name : "燁 鳴"
          },
          {
            _id : "65f55a9bf14fff03ba585f3d",
            role : "Team Member",
            name : "浩 傑"
          },
          {
            _id : "65f55a9bf14fff03ba585f3e",
            role : "Team Member",
            name : "啟 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3f",
            role : "Team Member",
            name : "維 飛"
          },
          {
            _id : "65f55a9bf14fff03ba585f40",
            role : "Team Member",
            name : "陳 慶"
          },
          {
            _id : "65f55d4af14fff03ba585f41",
            role : "Team Member",
            name : "劉 汶"
          },
          {
            _id : "65f55d4af14fff03ba585f42",
            role : "Team Member",
            name : "海 輝"
          }
        ],
        color: "#ff0000",
        createdBy: "65edbf9c5f5fc38e6b0aec80",
        createdDate: "2024-03-22T15:40:40.177Z",
        updatedBy: "65edbf9c5f5fc38e6b0aec80",
        updatedDate: "2024-04-02T12:43:11.562Z",
        tasks: [ ],
      },
      responseStatus: 200
    },
    {
      _id: "660bfd5f9fdb3271d1f38c12",
      action: "Update",
      timestamp: "2024-04-02T20:43:11.609+08:00",
      ipAddress: "::1",
      requestUrl: "/api/project/657c52b9c0beea14c87a81ac",
      requestData: {
        _id: "657c52b9c0beea14c87a81ac",
        title: "Project 1",
        description: "<p><strong>Web App Development</strong></p>",
        teamMembers: [
          {
            _id : "65edbf9c5f5fc38e6b0aec80",
            role : "Project Manager",
            name : "Tiffany Chu"
          },
          {
            _id : "65f55a9bf14fff03ba585f3b",
            role : "Team Member",
            name : "振 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3c",
            role : "Team Member",
            name : "燁 鳴"
          },
          {
            _id : "65f55a9bf14fff03ba585f3d",
            role : "Team Member",
            name : "浩 傑"
          },
          {
            _id : "65f55a9bf14fff03ba585f3e",
            role : "Team Member",
            name : "啟 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3f",
            role : "Team Member",
            name : "維 飛"
          },
          {
            _id : "65f55a9bf14fff03ba585f40",
            role : "Team Member",
            name : "陳 慶"
          },
          {
            _id : "65f55d4af14fff03ba585f41",
            role : "Team Member",
            name : "劉 汶"
          },
          {
            _id : "65f55d4af14fff03ba585f42",
            role : "Team Member",
            name : "海 輝"
          }
        ],
        color: "#ff0000",
        createdBy: "65edbf9c5f5fc38e6b0aec80",
        createdDate: "2024-03-22T15:40:40.177Z",
        updatedBy: "65edbf9c5f5fc38e6b0aec80",
        updatedDate: "2024-04-02T12:43:11.562Z",
        tasks: [ ],
      },
      responseStatus: 200
    },
    {
      _id: "660bfd5f9fdb3271d1f38c12",
      action: "Update",
      timestamp: "2024-04-02T20:43:11.609+08:00",
      ipAddress: "::1",
      requestUrl: "/api/project/657c52b9c0beea14c87a81ac",
      requestData: {
        _id: "657c52b9c0beea14c87a81ac",
        title: "Project 1",
        description: "<p><strong>Web App Development</strong></p>",
        teamMembers: [
          {
            _id : "65edbf9c5f5fc38e6b0aec80",
            role : "Project Manager",
            name : "Tiffany Chu"
          },
          {
            _id : "65f55a9bf14fff03ba585f3b",
            role : "Team Member",
            name : "振 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3c",
            role : "Team Member",
            name : "燁 鳴"
          },
          {
            _id : "65f55a9bf14fff03ba585f3d",
            role : "Team Member",
            name : "浩 傑"
          },
          {
            _id : "65f55a9bf14fff03ba585f3e",
            role : "Team Member",
            name : "啟 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3f",
            role : "Team Member",
            name : "維 飛"
          },
          {
            _id : "65f55a9bf14fff03ba585f40",
            role : "Team Member",
            name : "陳 慶"
          },
          {
            _id : "65f55d4af14fff03ba585f41",
            role : "Team Member",
            name : "劉 汶"
          },
          {
            _id : "65f55d4af14fff03ba585f42",
            role : "Team Member",
            name : "海 輝"
          }
        ],
        color: "#ff0000",
        createdBy: "65edbf9c5f5fc38e6b0aec80",
        createdDate: "2024-03-22T15:40:40.177Z",
        updatedBy: "65edbf9c5f5fc38e6b0aec80",
        updatedDate: "2024-04-02T12:43:11.562Z",
        tasks: [ ],
      },
      responseStatus: 200
    },
    {
      _id: "660bfd5f9fdb3271d1f38c12",
      action: "Update",
      timestamp: "2024-04-02T20:43:11.609+08:00",
      ipAddress: "::1",
      requestUrl: "/api/project/657c52b9c0beea14c87a81ac",
      requestData: {
        _id: "657c52b9c0beea14c87a81ac",
        title: "Project 1",
        description: "<p><strong>Web App Development</strong></p>",
        teamMembers: [
          {
            _id : "65edbf9c5f5fc38e6b0aec80",
            role : "Project Manager",
            name : "Tiffany Chu"
          },
          {
            _id : "65f55a9bf14fff03ba585f3b",
            role : "Team Member",
            name : "振 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3c",
            role : "Team Member",
            name : "燁 鳴"
          },
          {
            _id : "65f55a9bf14fff03ba585f3d",
            role : "Team Member",
            name : "浩 傑"
          },
          {
            _id : "65f55a9bf14fff03ba585f3e",
            role : "Team Member",
            name : "啟 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3f",
            role : "Team Member",
            name : "維 飛"
          },
          {
            _id : "65f55a9bf14fff03ba585f40",
            role : "Team Member",
            name : "陳 慶"
          },
          {
            _id : "65f55d4af14fff03ba585f41",
            role : "Team Member",
            name : "劉 汶"
          },
          {
            _id : "65f55d4af14fff03ba585f42",
            role : "Team Member",
            name : "海 輝"
          }
        ],
        color: "#ff0000",
        createdBy: "65edbf9c5f5fc38e6b0aec80",
        createdDate: "2024-03-22T15:40:40.177Z",
        updatedBy: "65edbf9c5f5fc38e6b0aec80",
        updatedDate: "2024-04-02T12:43:11.562Z",
        tasks: [ ],
      },
      responseStatus: 200
    },
    {
      _id: "660bfd5f9fdb3271d1f38c12",
      action: "Update",
      timestamp: "2024-04-02T20:43:11.609+08:00",
      ipAddress: "::1",
      requestUrl: "/api/project/657c52b9c0beea14c87a81ac",
      requestData: {
        _id: "657c52b9c0beea14c87a81ac",
        title: "Project 1",
        description: "<p><strong>Web App Development</strong></p>",
        teamMembers: [
          {
            _id : "65edbf9c5f5fc38e6b0aec80",
            role : "Project Manager",
            name : "Tiffany Chu"
          },
          {
            _id : "65f55a9bf14fff03ba585f3b",
            role : "Team Member",
            name : "振 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3c",
            role : "Team Member",
            name : "燁 鳴"
          },
          {
            _id : "65f55a9bf14fff03ba585f3d",
            role : "Team Member",
            name : "浩 傑"
          },
          {
            _id : "65f55a9bf14fff03ba585f3e",
            role : "Team Member",
            name : "啟 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3f",
            role : "Team Member",
            name : "維 飛"
          },
          {
            _id : "65f55a9bf14fff03ba585f40",
            role : "Team Member",
            name : "陳 慶"
          },
          {
            _id : "65f55d4af14fff03ba585f41",
            role : "Team Member",
            name : "劉 汶"
          },
          {
            _id : "65f55d4af14fff03ba585f42",
            role : "Team Member",
            name : "海 輝"
          }
        ],
        color: "#ff0000",
        createdBy: "65edbf9c5f5fc38e6b0aec80",
        createdDate: "2024-03-22T15:40:40.177Z",
        updatedBy: "65edbf9c5f5fc38e6b0aec80",
        updatedDate: "2024-04-02T12:43:11.562Z",
        tasks: [ ],
      },
      responseStatus: 200
    },
    {
      _id: "660bfd5f9fdb3271d1f38c12",
      action: "Update",
      timestamp: "2024-04-02T20:43:11.609+08:00",
      ipAddress: "::1",
      requestUrl: "/api/project/657c52b9c0beea14c87a81ac",
      requestData: {
        _id: "657c52b9c0beea14c87a81ac",
        title: "Project 1",
        description: "<p><strong>Web App Development</strong></p>",
        teamMembers: [
          {
            _id : "65edbf9c5f5fc38e6b0aec80",
            role : "Project Manager",
            name : "Tiffany Chu"
          },
          {
            _id : "65f55a9bf14fff03ba585f3b",
            role : "Team Member",
            name : "振 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3c",
            role : "Team Member",
            name : "燁 鳴"
          },
          {
            _id : "65f55a9bf14fff03ba585f3d",
            role : "Team Member",
            name : "浩 傑"
          },
          {
            _id : "65f55a9bf14fff03ba585f3e",
            role : "Team Member",
            name : "啟 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3f",
            role : "Team Member",
            name : "維 飛"
          },
          {
            _id : "65f55a9bf14fff03ba585f40",
            role : "Team Member",
            name : "陳 慶"
          },
          {
            _id : "65f55d4af14fff03ba585f41",
            role : "Team Member",
            name : "劉 汶"
          },
          {
            _id : "65f55d4af14fff03ba585f42",
            role : "Team Member",
            name : "海 輝"
          }
        ],
        color: "#ff0000",
        createdBy: "65edbf9c5f5fc38e6b0aec80",
        createdDate: "2024-03-22T15:40:40.177Z",
        updatedBy: "65edbf9c5f5fc38e6b0aec80",
        updatedDate: "2024-04-02T12:43:11.562Z",
        tasks: [ ],
      },
      responseStatus: 200
    },
    {
      _id: "660bfd5f9fdb3271d1f38c12",
      action: "Update",
      timestamp: "2024-04-02T20:43:11.609+08:00",
      ipAddress: "::1",
      requestUrl: "/api/project/657c52b9c0beea14c87a81ac",
      requestData: {
        _id: "657c52b9c0beea14c87a81ac",
        title: "Project 1",
        description: "<p><strong>Web App Development</strong></p>",
        teamMembers: [
          {
            _id : "65edbf9c5f5fc38e6b0aec80",
            role : "Project Manager",
            name : "Tiffany Chu"
          },
          {
            _id : "65f55a9bf14fff03ba585f3b",
            role : "Team Member",
            name : "振 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3c",
            role : "Team Member",
            name : "燁 鳴"
          },
          {
            _id : "65f55a9bf14fff03ba585f3d",
            role : "Team Member",
            name : "浩 傑"
          },
          {
            _id : "65f55a9bf14fff03ba585f3e",
            role : "Team Member",
            name : "啟 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3f",
            role : "Team Member",
            name : "維 飛"
          },
          {
            _id : "65f55a9bf14fff03ba585f40",
            role : "Team Member",
            name : "陳 慶"
          },
          {
            _id : "65f55d4af14fff03ba585f41",
            role : "Team Member",
            name : "劉 汶"
          },
          {
            _id : "65f55d4af14fff03ba585f42",
            role : "Team Member",
            name : "海 輝"
          }
        ],
        color: "#ff0000",
        createdBy: "65edbf9c5f5fc38e6b0aec80",
        createdDate: "2024-03-22T15:40:40.177Z",
        updatedBy: "65edbf9c5f5fc38e6b0aec80",
        updatedDate: "2024-04-02T12:43:11.562Z",
        tasks: [ ],
      },
      responseStatus: 200
    },
    {
      _id: "660bfd5f9fdb3271d1f38c12",
      action: "Delete",
      timestamp: "2024-04-02T20:43:11.609+08:00",
      ipAddress: "::1",
      requestUrl: "/api/project/657c52b9c0beea14c87a81ac",
      requestData: {
        _id: "657c52b9c0beea14c87a81ac",
        title: "Project 1",
        description: "<p><strong>Web App Development</strong></p>",
        teamMembers: [
          {
            _id : "65edbf9c5f5fc38e6b0aec80",
            role : "Project Manager",
            name : "Tiffany Chu"
          },
          {
            _id : "65f55a9bf14fff03ba585f3b",
            role : "Team Member",
            name : "振 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3c",
            role : "Team Member",
            name : "燁 鳴"
          },
          {
            _id : "65f55a9bf14fff03ba585f3d",
            role : "Team Member",
            name : "浩 傑"
          },
          {
            _id : "65f55a9bf14fff03ba585f3e",
            role : "Team Member",
            name : "啟 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3f",
            role : "Team Member",
            name : "維 飛"
          },
          {
            _id : "65f55a9bf14fff03ba585f40",
            role : "Team Member",
            name : "陳 慶"
          },
          {
            _id : "65f55d4af14fff03ba585f41",
            role : "Team Member",
            name : "劉 汶"
          },
          {
            _id : "65f55d4af14fff03ba585f42",
            role : "Team Member",
            name : "海 輝"
          }
        ],
        color: "#ff0000",
        createdBy: "65edbf9c5f5fc38e6b0aec80",
        createdDate: "2024-03-22T15:40:40.177Z",
        updatedBy: "65edbf9c5f5fc38e6b0aec80",
        updatedDate: "2024-04-02T12:43:11.562Z",
        tasks: [ ],
      },
      responseStatus: 200
    },
    {
      _id: "660bfd5f9fdb3271d1f38c12",
      action: "Create",
      timestamp: "2024-04-02T20:43:11.609+08:00",
      ipAddress: "::1",
      requestUrl: "/api/project/657c52b9c0beea14c87a81ac",
      requestData: {
        _id: "657c52b9c0beea14c87a81ac",
        title: "Project 1",
        description: "<p><strong>Web App Development</strong></p>",
        teamMembers: [
          {
            _id : "65edbf9c5f5fc38e6b0aec80",
            role : "Project Manager",
            name : "Tiffany Chu"
          },
          {
            _id : "65f55a9bf14fff03ba585f3b",
            role : "Team Member",
            name : "振 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3c",
            role : "Team Member",
            name : "燁 鳴"
          },
          {
            _id : "65f55a9bf14fff03ba585f3d",
            role : "Team Member",
            name : "浩 傑"
          },
          {
            _id : "65f55a9bf14fff03ba585f3e",
            role : "Team Member",
            name : "啟 明"
          },
          {
            _id : "65f55a9bf14fff03ba585f3f",
            role : "Team Member",
            name : "維 飛"
          },
          {
            _id : "65f55a9bf14fff03ba585f40",
            role : "Team Member",
            name : "陳 慶"
          },
          {
            _id : "65f55d4af14fff03ba585f41",
            role : "Team Member",
            name : "劉 汶"
          },
          {
            _id : "65f55d4af14fff03ba585f42",
            role : "Team Member",
            name : "海 輝"
          }
        ],
        color: "#ff0000",
        createdBy: "65edbf9c5f5fc38e6b0aec80",
        createdDate: "2024-03-22T15:40:40.177Z",
        updatedBy: "65edbf9c5f5fc38e6b0aec80",
        updatedDate: "2024-04-02T12:43:11.562Z",
        tasks: [ ],
      },
      responseStatus: 200
    },
  ];

  return auditLogs;
}