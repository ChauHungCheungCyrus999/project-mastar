import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Link, Box } from '@mui/material';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';

import CCard from '../custom/CCard';
import BorderLinearProgress from '../custom/BorderLinearProgress';
import AccountAvatar from '../AccountAvatar';
import ProjectStatusBarChart from '../project-dashboard/ProjectStatusBarChart';

import { useTranslation } from 'react-i18next';

import { formatDate } from '../../utils/DateUtils.js';
import { displayHtml } from '../../utils/RichTextUtils';

const ProjectCard = ({ project, handleTagManagement, handleEdit, handleDelete, role }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const completionRate = project.totalTasks === 0 ? 0 : (project.completedTasks / project.totalTasks) * 100;

  // Show More
  const [showMore, setShowMore] = useState(false);
  const toggleShowMore = (event) => {
    event.stopPropagation();
    setShowMore(!showMore);
  };

  // Read
  const onRead = (event) => {
    event.stopPropagation();
    navigate(`/project/${project._id}/progress`);
    navigate(0);
  }

  // Tag Management
  const onTagManagement = () => {
    handleTagManagement(project._id);
  };

  // Update
  const onEdit = () => {
    handleEdit(project._id);
  };

  const onDelete = () => {
    handleDelete(project._id);
  };

  return (
    <CCard
      mode="project"
      item={project}
      handleRead={onRead}
      handleTagManagement={onTagManagement}
      handleEdit={onEdit}
      handleDelete={onDelete}
      title={project.title}
      icon={FolderOutlinedIcon}
      role={role}
    >
      {/*<Typography variant="body2" sx={{ wordWrap: 'break-word', overflow: 'hidden', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }} gutterBottom>
        <>
          {showMore ? displayHtml(project.description) : displayHtml(project.description.slice(0, 250))}
          {project.description.length > 250 && !showMore && (
            <span>
              ...
              <Typography variant="body2" sx={{ float: 'right' }}>
                <Link href="#show-more" onClick={toggleShowMore}>
                  {t("showMore")}
                </Link>
              </Typography>
            </span>
          )}
          {showMore && project.description.length > 250 && (
            <Typography variant="body2" sx={{ float: 'right' }}>
              <Link href="#show-more" onClick={toggleShowMore}>
                {t("showLess")}
              </Link>
            </Typography>
          )}
        </>
      </Typography>*/}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div>
          <Typography variant="body2" color="text.secondary">
            {t('createdDate')}{t('colon')}{formatDate(project.createdDate)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('updatedDate')}{t('colon')}{formatDate(project.updatedDate)}
          </Typography>
        </div>

        <AccountAvatar users={project.teamMembers} size="small" displayPopper={true} />
      </div>

      <ProjectStatusBarChart projectId={project._id} />

      {!isNaN(completionRate)? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BorderLinearProgress variant="determinate" value={completionRate} />
          <Typography variant="body2">{`${project.completedTasks}/${project.totalTasks} (${completionRate.toFixed(0)}%)`}</Typography>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BorderLinearProgress variant="determinate" value={0} />
          <Typography variant="body2">{`0/0 (0%)`}</Typography>
        </div>
      )}
    </CCard>
  );
};

export default ProjectCard;