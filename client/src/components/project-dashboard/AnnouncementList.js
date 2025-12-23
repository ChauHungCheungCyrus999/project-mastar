import React, { useContext, useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useMediaQuery,
  Box, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Button
} from '@mui/material';
import { Campaign, LocalLibraryOutlined } from '@mui/icons-material';

import AccountAvatar from '../AccountAvatar';
import DashboardCard from '../custom/DashboardCard';
import ProjectFolder from '../ProjectFolder';
import AnnouncementDialog from '../AnnouncementDialog';

import UserContext from '../../UserContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import dayjs from 'dayjs';
import { displayHtml } from '../../utils/RichTextUtils';

const AnnouncementList = ({ dashboardId, cardId }) => {
  const theme = useTheme();
  const { user } = useContext(UserContext);
  const token = localStorage.getItem('token');
  const { projectId } = useParams();
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const navigate = useNavigate();

  // State for announcements
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Fetch announcements from API
  useEffect(() => {
    const fetchAnnouncementsByUser = async () => {
      if (!token) {
        console.error('User token is not available');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/announcementsByUser`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = Array.isArray(response.data) ? response.data : [];

        // If we're inside a project route, only keep announcements of that project
        const filtered = projectId
          ? data.filter((a) => a.project?._id === projectId)
          : data;

        // Sort newest first by createdDate if available, else startDate
        const sorted = filtered.sort((a, b) => {
          const ad = a.createdDate || a.startDate || 0;
          const bd = b.createdDate || b.startDate || 0;
          return new Date(bd) - new Date(ad);
        });

        setAnnouncements(sorted);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncementsByUser();
  }, [projectId, token]);  

  // Handle row click to open dialog
  const handleRowClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setDialogOpen(true);
  };

  // Close dialog
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAnnouncement(null);
  };

  const handleLearnMoreClick = () => {
    if (projectId) {
      navigate(`/project/${projectId}/announcement`);
    }
    else {
      navigate('/announcement');
    }
  };

  return (
    <>
      <DashboardCard
        dashboardId={dashboardId}
        cardId={cardId}
        title={t('announcement')}
        subheader={t('numOfAnnouncements') + t('colon') + announcements.length}
        description={t('announcementDesc')}
        height={400}
        icon={Campaign}
        color="#193f70"
      >
        {loading ? (
          <Skeleton variant="rectangular" width="100%" height={118} />
        ) : announcements.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body1">{t('noAnnouncements')}</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table
                size="small"
                stickyHeader
                sx={{
                  "& .MuiTableRow-root:hover": {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
              >
                <TableHead style={{ whiteSpace: 'nowrap' }}>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold' }}>{t('project')}</TableCell>
                    <TableCell style={{ fontWeight: 'bold' }}>{t('content')}</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell style={{ fontWeight: 'bold' }}>{t('createdBy')}</TableCell>
                        <TableCell style={{ fontWeight: 'bold' }}>{t('date')}</TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {announcements.map((announcement, index) => {
                    const userIsCreator = announcement.createdBy?._id === user?._id;

                    //if (
                      //user?.email === process.env.REACT_APP_ADMIN_EMAIL ||
                      //userIsCreator
                    //) {
                      return (
                        <TableRow
                          key={index}
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleRowClick(announcement)}
                        >
                          <TableCell>
                            <Typography variant="body2">
                              <ProjectFolder project={announcement.project} />
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                              {announcement.title}
                            </Typography>

                            <Typography 
                              variant="body2" 
                              style={{ 
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 1,
                                maxWidth: '250px'  // Ensure it fits within the container width
                              }}
                            >
                              {displayHtml(announcement.content)}
                            </Typography>
                          </TableCell>

                          {!isMobile && (
                            <>
                              <TableCell>
                                <AccountAvatar
                                  users={[announcement.createdBy]}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" style={{ whiteSpace: 'nowrap' }}>
                                  {`${dayjs(announcement.startDate).format('YYYY-MM-DD')}`}
                                </Typography>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      );
                    //}
                    //return null;
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 1, position: 'static', bottom: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<LocalLibraryOutlined />}
                onClick={handleLearnMoreClick}
              >
                {t('learnMore')}
              </Button>
            </Box>
          </>
        )}
      </DashboardCard>

      {/* Dialog for displaying announcement details */}
      {selectedAnnouncement && (
        <AnnouncementDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          announcement={selectedAnnouncement}
        />
      )}
    </>
  );
};

export default AnnouncementList;
