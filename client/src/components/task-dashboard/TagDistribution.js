import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CircularProgress } from '@mui/material';
import { LocalOffer } from '@mui/icons-material';
import DashboardCard from '../custom/DashboardCard';
import axios from 'axios';

import { useTranslation } from 'react-i18next';

import CDialog from '../custom/CDialog';
import ListTableSwitcher from '../task/ListTableSwitcher';

const TagDistribution = ({ project }) => {
  const { t, i18n } = useTranslation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [selectedTagTasks, setSelectedTagTasks] = useState([]);
  const [selectedTagName, setSelectedTagName] = useState('');

  const getDisplayValue = (tag) => {
    if (!tag) return '';
    switch (i18n.language) {
      case 'zh-hk':
        return tag.name.zhHK;
      case 'zh-cn':
        return tag.name.zhCN;
      default:
        return tag.name.enUS;
    }
  };

  useEffect(() => {
    const fetchTagsAndTasks = async () => {
      try {
        const tagsResponse = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tags/project/${project._id}/active`);
        const tasksResponse = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/tasks/project/${project._id}`);

        const tagMap = tagsResponse.data.reduce((acc, tag) => {
          acc[tag._id] = { name: getDisplayValue(tag), counts: {}, tasks: [] };
          return acc;
        }, {});

        tasksResponse.data.forEach(task => {
          task.tags.forEach(tag => {
            const tagEntry = tagMap[tag._id];
            if (tagEntry) {
              tagEntry.counts[task.status] = (tagEntry.counts[task.status] || 0) + 1;
              tagEntry.tasks.push(task);
            }
          });
        });

        const chartData = Object.values(tagMap).map(tag => ({
          name: tag.name,
          ...tag.counts,
          tasks: tag.tasks,
        }));

        setData(chartData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchTagsAndTasks();
  }, [project._id, i18n.language]);

  const handleBarClick = (data) => {
    setSelectedTagName(data.name);
    setSelectedTagTasks(data.tasks);
    setIsOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setIsOpenDialog(false);
  };

  return (
    <DashboardCard
      dashboardId="Task Dashboard"
      cardId="Tag Distribution"
      title={t('tagDistribution')}
      description={t('tagDistributionDesc')}
      height={550}
      subheader={`${t('numOfTags')}${t('colon')}${data.length}`}
      icon={LocalOffer}
      color={project.color}
    >
      {loading ? (
        <CircularProgress />
      ) : data.length === 0 ? (
        <div>{t('noTagsInProject')}</div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            onClick={(e) => {
              if (e && e.activePayload) {
                handleBarClick(e.activePayload[0].payload);
              }
            }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend wrapperStyle={{ whiteSpace: "break-spaces" }} />
            <Bar dataKey="To Do" stackId="a" fill="#89CFF0" name={t('toDo')} />
            <Bar dataKey="In Progress" stackId="a" fill="#FFE5A0" name={t('inProgress')} />
            <Bar dataKey="Under Review" stackId="a" fill="#E6CFF2" name={t('underReview')} />
            <Bar dataKey="Done" stackId="a" fill="#D4EDBC" name={t('done')} />
            <Bar dataKey="On Hold" stackId="a" fill="#FFBD9C" name={t('onHold')} />
            <Bar dataKey="Cancelled" stackId="a" fill="#A9A9A9" name={t('cancelled')} />
          </BarChart>
        </ResponsiveContainer>
      )}

      <CDialog
        mode="read"
        open={isOpenDialog}
        onClose={handleCloseDialog}
        title={`${selectedTagName} (${selectedTagTasks.length})`}
      >
        {selectedTagTasks.length > 0 && (
          <ListTableSwitcher
            project={project}
            tasks={selectedTagTasks}
            setTasks={setSelectedTagTasks}
            displayCheckbox={false}
            displayTab={true}
            displayProjectSelector={false}
            displayMilestoneSelector={true}
          />
        )}
      </CDialog>
    </DashboardCard>
  );
};

export default TagDistribution;