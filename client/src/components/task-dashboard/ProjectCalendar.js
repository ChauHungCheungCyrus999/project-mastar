import React, { useContext, useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { zhCN, zhHK } from '@mui/x-date-pickers/locales';
import {
  Grid,
  Card, CardContent,
  List, ListItem, ListItemText, ListItemButton,
  FormControlLabel,
  Typography, ButtonGroup, Button, Chip, Checkbox
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { formatDate } from '../../utils/DateUtils.js';

import DashboardCard from '../custom/DashboardCard';
import ListTableSwitcher from '../task/ListTableSwitcher';

import { useTranslation } from 'react-i18next';

import UserContext from '../../UserContext';

const ProjectCalendar = ({ project, tasks }) => {
  const { user, setUser } = useContext(UserContext);

  const { t, i18n } = useTranslation();
  let locale = null;
  if (i18n.language === 'zh-cn') {
    locale = zhCN.components.MuiLocalizationProvider.defaultProps.localeText;
  } else if (i18n.language === 'zh-hk') {
    locale = zhHK.components.MuiLocalizationProvider.defaultProps.localeText;
  }

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [view, setView] = useState('day'); // set default view

  const [showOwnTasks, setShowOwnTasks] = useState(false);

  useEffect(() => {
    handleDateClick(selectedDate);
  }, [selectedDate/*, filteredTasks*/]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    date = new Date(date);
  
    let filteredTasks = [];
  
    if (view === 'year') {
      // Filter tasks for the whole year
      filteredTasks = tasks.filter((task) => {
        if (task.startDate && task.endDate) {
          const taskStartDate = new Date(task.startDate);
          const taskEndDate = new Date(task.endDate);
          return (
            (date.getFullYear() === new Date(taskStartDate).getFullYear() ||
              date.getFullYear() === new Date(taskEndDate).getFullYear()) &&
            (!showOwnTasks || task.personInCharge.includes(user._id))
          );
        }
        return false;
      });
    } else if (view === 'month') {
      // Filter tasks for the whole month
      filteredTasks = tasks.filter((task) => {
        if (task.startDate && task.endDate) {
          const taskStartDate = new Date(task.startDate);
          const taskEndDate = new Date(task.endDate);
          return (
            (date.getMonth() === new Date(taskStartDate).getMonth() ||
              date.getFullYear() === new Date(taskStartDate).getFullYear() ||
              date.getMonth() === new Date(taskEndDate).getMonth() ||
              date.getFullYear() === new Date(taskEndDate).getFullYear()) &&
            (!showOwnTasks || task.personInCharge.includes(user._id))
          );
        }
        return false;
      });
    } else {
      // Filter tasks for the selected date
      filteredTasks = tasks.filter((task) => {
        if (task.startDate && task.endDate) {
          const taskStartDate = new Date(task.startDate);
          const taskEndDate = new Date(task.endDate);
          return (
            (date >= taskStartDate && date <= taskEndDate) &&
            (!showOwnTasks || task.personInCharge.includes(user._id))
          );
        }
        return false;
      });
    }
  
    setFilteredTasks(filteredTasks);
  };

  const handleViewChange = (newView) => {
    setView(newView);
    handleDateClick(selectedDate); // Update the filtered tasks based on the new view
  };

  return (
    <DashboardCard
      dashboardId="Task Dashboard"
      cardId="Project Calendar"
      title={t('projectCalendar')}
      description={t('projectCalendarDesc')}
      height={600}
      icon={CalendarMonthIcon}
      color={project.color}
      subheader={t('totalTasks') + t('colon') + filteredTasks.length}
    >
      <CardContent>
        <Grid container style={{ display: 'flex' }}>
          <Grid item xs={12} sm={12} md={5} lg={4} xl={3}>
            <Grid sx={{ width: '100%' }}>
              <ButtonGroup size="small" aria-label="date-navigation">
                <Button
                  variant={view === 'year' ? 'contained' : 'outlined'}
                  onClick={() => handleViewChange('year')}
                >
                  {t('year')}
                </Button>
                <Button
                  variant={view === 'month' ? 'contained' : 'outlined'}
                  onClick={() => handleViewChange('month')}
                >
                  {t('month')}
                </Button>
                <Button
                  variant={view === 'day' ? 'contained' : 'outlined'}
                  onClick={() => handleViewChange('day')}
                >
                  {t('day')}
                </Button>
              </ButtonGroup>
              <LocalizationProvider dateAdapter={AdapterDayjs} localeText={locale}>
                <DateCalendar
                  showDaysOutsideCurrentMonth
                  displayWeekNumber
                  onChange={handleDateClick}
                  views={[view]}
                />
              </LocalizationProvider>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={showOwnTasks}
                      onChange={(event) => setShowOwnTasks(event.target.checked)}
                    />
                  }
                  label={t('displayMyTasksOnly')}
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={12} md={7} lg={8} xl={9}>
            {selectedDate && (
              <div>
                <Typography variant="subtitle2">
                  {view === 'year' ? (
                    <Typography variant="h7">{new Date(selectedDate).getFullYear()}</Typography>
                  ) : view === 'month' ? (
                    <Typography variant="h7">{formatDate(new Date(selectedDate)).substring(0, 7)}</Typography>
                  ) : (
                    <Typography variant="h7">{formatDate(new Date(selectedDate))}</Typography>
                  )}
                </Typography>

                {/*<div style={{ maxHeight: '300px', overflow: 'auto' }}>
                  <List>
                    {filteredTasks.map((task) => (
                      <ListItem key={task._id} disablePadding>
                        <ListItemButton
                          component="a"
                          href={`/project/${project._id}/task/${task._id}`}
                        >
                          <ListItemText
                            primary={task.taskName}
                            secondary={
                              <React.Fragment>
                                <Typography component="div" variant="body2" color="textPrimary">
                                  <strong>{t('category')}:</strong> {task.category}
                                </Typography>
                                <br />
                                <Chip size="small" label={task.status} />
                                <Chip size="small" label={task.priority} />
                                <Chip size="small" label={task.difficultyLevel} />
                                <br />
                                <Typography component="div" variant="body2" color="textPrimary">
                                  <strong>{t('personInCharge')}:</strong> {task.personInCharge.join(', ')}
                                </Typography>
                                <br />
                                <Typography component="div" variant="body2" color="textPrimary">
                                  <strong>{t('startDate')} - {t('endDate')}:</strong> {task.startDate} - {task.endDate}
                                </Typography>
                              </React.Fragment>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </div>*/}

                <ListTableSwitcher
                  project={project}
                  tasks={filteredTasks}
                  displayCheckbox={false}
                  displayTab={true}
                />
              </div>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </DashboardCard>
  );
};

export default ProjectCalendar;