import React, { useContext, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';

import { useTranslation } from 'react-i18next';

import UserContext from '../../UserContext';

const ProjectStatusBarChart = ({ projectId }) => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext);

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const colorStatuses = [
    { status: 'unassigned', backgroundColor: '', color: 'black' },
    { status: 'toDo', backgroundColor: '#89CFF0', color: 'black' },
    { status: 'inProgress', backgroundColor: '#FFE5A0', color: 'black' },
    { status: 'underReview', backgroundColor: '#E6CFF2', color: 'black' },
    { status: 'done', backgroundColor: '#D4EDBC', color: 'black' },
    { status: 'onHold', backgroundColor: '#FFBD9C', color: 'black' },
    { status: 'cancelled', backgroundColor: '#C9C9C9', color: 'black' },
    { status: 'none', backgroundColor: 'transparent', color: '' }
  ];

  useEffect(() => {
    const fetchTaskCounts = async () => {
      try {
        let response;
        if (user.email === process.env.REACT_APP_ADMIN_EMAIL) {
          response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/projects/taskCount/admin`);
        } else {
          response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/projects/taskCount`, { userId: user._id });
        }

        if (response) {
          const projectData = response.data.find(project => project._id === projectId);
          if (projectData) {
            const chartData = Object.entries(projectData.statusCounts)
              .filter(([key]) => key !== 'all')
              .map(([key, value]) => ({
                status: key,
                count: value,
                fill: colorStatuses.find(status => status.status === key)?.backgroundColor
              }));
            setData(chartData);
          }
        }
      } catch (error) {
        setError('Error fetching task counts:', error);
        console.error('Error fetching task counts:', error);
      }
    };

    fetchTaskCounts();
  }, [projectId, user]);

  if (error) return <p>{error}</p>;
  if (!data) return <p>Loading data...</p>;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="status" tickFormatter={(value) => t(`${value}`)} />
        <YAxis />
        {/*<Tooltip />*/}
        {/*<Legend wrapperStyle={{ whiteSpace: "break-spaces" }} />*/}
        <Bar dataKey="count" fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProjectStatusBarChart;