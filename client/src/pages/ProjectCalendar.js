import React, { useContext, useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Home, Folder, CalendarMonth } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { useMediaQuery, Paper, Stack, Typography, Button, Skeleton, Grid } from '@mui/material';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import rrulePlugin from '@fullcalendar/rrule'; // Plugin for recurring events
import { RRule } from 'rrule'; // Plugin for recurring events

import MainContent from '../components/MainContent';
import CDialog from '../components/custom/CDialog';
import ListTableSwitcher from '../components/task/ListTableSwitcher';
import ConfirmDeleteDialog from '../components/custom/ConfirmDeleteDialog';
import CAlert from '../components/custom/CAlert';
import EventPopper from '../components/event/EventPopper';
import CreateEventBtn from '../components/event/CreateEventBtn';
import EventDialog from '../components/event/EventDialog';

import UserContext from '../UserContext';

import { capitalizeWordsExceptFirst } from '../utils/StringUtils.js';

import './project-calendar.css';

const ProjectCalendar = () => {
  const { user, setUser } = useContext(UserContext);
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery('(max-width:600px)');
  
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [events, setEvents] = useState([]);

  const breadcrumbItems = [
    { label: 'home', href: '/', icon: <Home sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: project?.title, href: `/project/${projectId}/dashboard`, icon: <Folder sx={{ mr: 0.5 }} fontSize="inherit" /> },
    { label: 'calendar', icon: <CalendarMonth sx={{ mr: 0.5 }} fontSize="inherit" /> },
  ];

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/project/${projectId}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/events/project/${projectId}`);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };

    fetchProject();
    fetchEvents();
  }, [projectId]);

  const alertRef = useRef();

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 10);
  }, []);

  const [popperAnchorEl, setPopperAnchorEl] = useState(null);
  const [selectedEventForPopper, setSelectedEventForPopper] = useState(null);
  const [popperOpen, setPopperOpen] = useState(false);

  const handleMouseEnter = (info, event) => {
    setPopperAnchorEl(event.currentTarget);
    setSelectedEventForPopper(info.event.extendedProps.event);
    setPopperOpen(true);
  };

  const handleMouseLeave = () => {
    setPopperOpen(false);
    setSelectedEventForPopper(null);
  };

  const renderEventContent = (eventInfo) => {
    return (
      <div
        onMouseEnter={(e) => handleMouseEnter(eventInfo, e)}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'pointer' }}
      >
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
      </div>
    );
  };

  /*const colorStatuses = [
    { status: t('unassigned'), backgroundColor: '', color: 'black' },
    { status: t('toDo'), backgroundColor: '#89CFF0', color: 'black' },
    { status: t('inProgress'), backgroundColor: '#FFE5A0', color: 'black' },
    { status: t('underReview'), backgroundColor: '#E6CFF2', color: 'black' },
    { status: t('done'), backgroundColor: '#D4EDBC', color: 'black' },
    { status: t('onHold'), backgroundColor: '#FFBD9C', color: 'black' },
    { status: t('cancelled'), backgroundColor: '#C9C9C9', color: 'black' }
  ];

  const getStatusColor = (status) => {
    const foundStatus = colorStatuses.find(
      (item) => item.status === t(capitalizeWordsExceptFirst(status))
    );
    return foundStatus ? foundStatus.backgroundColor : '#dcdcdc';
  };*/

  const [selectedEvents, setSelectedEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventUpdates, setEventUpdates] = useState([]);

  const [eventToDelete, setEventToDelete] = useState(null);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (eventUpdates.length > 0) {
        event.preventDefault();
        event.returnValue = t('unsavedChangesWarning');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [eventUpdates, t]);

  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;
    setSelectedDate(clickedDate);

    const eventsForDate = events.filter((event) => {
      const startDate = event.startDate;
      const endDate = event.endDate;
      return startDate <= clickedDate && endDate >= clickedDate;
    });

    if (eventsForDate.length > 0) {
      setSelectedEvents(eventsForDate);
      setCreateFormOpen(true);
      setDialogOpen(true);
    } else {
      setCreateFormOpen(true);
    }
  };

  const handleEventClick = (info) => {
    const eventId = info.event.id;
    const event = events.find((event) => event._id === eventId);

    // Close popper
    setPopperOpen(false);
    setSelectedEventForPopper(null);

    setSelectedEvent(event);
    setEditDialogOpen(true);
  };

  // Update event and eventUpdates when an event is dropped
  const handleEventDrop = (info) => {
    const event = events.find((e) => e._id === info.event.id);
    
    let endDate = info.event.endStr;
    
    // For all-day events, subtract 1 day from endDate since we added +1 when mapping
    if (event && event.allDay) {
      const endDateObj = new Date(info.event.endStr);
      endDateObj.setDate(endDateObj.getDate() - 1);
      endDate = endDateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Hong_Kong' });
    }

    const updatedEvent = {
      id: info.event.id,
      startDate: info.event.startStr,
      endDate: endDate
    };

    // Update events state immediately
    setEvents((prevEvents) =>
      prevEvents.map(event =>
        event._id === updatedEvent.id ? { ...event, startDate: updatedEvent.startDate, endDate: updatedEvent.endDate } : event
      )
    );

    // Update eventUpdates state
    setEventUpdates((prev) => {
      const existingUpdate = prev.find((u) => u.id === updatedEvent.id);
      return existingUpdate
        ? prev.map((u) => (u.id === updatedEvent.id ? updatedEvent : u))
        : [...prev, updatedEvent];
    });
  };

  const handleEventResize = (info) => {
    const event = events.find((e) => e._id === info.event.id);
    
    let endDate = info.event.endStr;
    
    // For all-day events, subtract 1 day from endDate since we added +1 when mapping
    if (event && event.allDay) {
      const endDateObj = new Date(info.event.endStr);
      endDateObj.setDate(endDateObj.getDate() - 1);
      endDate = endDateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Hong_Kong' });
    }

    const updatedEvent = {
      id: info.event.id,
      startDate: info.event.startStr,
      endDate: endDate
    };

    // Update events state immediately
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event._id === updatedEvent.id ? { ...event, startDate: updatedEvent.startDate, endDate: updatedEvent.endDate } : event
      )
    );

    // Track pending updates for Save
    setEventUpdates((prev) => {
      const existingUpdate = prev.find((u) => u.id === updatedEvent.id);
      return existingUpdate
        ? prev.map((u) => (u.id === updatedEvent.id ? updatedEvent : u))
        : [...prev, updatedEvent];
    });
  };

  const handleSaveChanges = async () => {
    try {
      for (const update of eventUpdates) {
        const updateData = {
          ...update,
          updatedBy: user._id, // Ensure current user ID is included
        };

        await axios.put(
          `${process.env.REACT_APP_SERVER_HOST}/api/event/${update.id}`,
          updateData
        );
      }

      setEvents((prevEvents) =>
        prevEvents.map((event) => {
          const update = eventUpdates.find((u) => u.id === event._id);
          return update ? { ...event, ...update } : event;
        })
      );

      setEventUpdates([]);
      alertRef.current.displayAlert('success', t('saveSuccess'));
    } catch (error) {
      console.error('Error updating events:', error.message);
      alertRef.current.displayAlert('error', t('saveFail'));
    }
  };

  // Helper function for recurring events
  const getRRule = (event) => {
    if (event.recurrence === 'None') return null;

    const freqMapping = {
      Daily: RRule.DAILY,
      Weekly: RRule.WEEKLY,
      Monthly: RRule.MONTHLY,
      Yearly: RRule.YEARLY,
    };

    const rruleOptions = {
      freq: freqMapping[event.recurrence],
      dtstart: new Date(event.startDate), // Start date of the recurrence
    };

    /*if (event.endDate) {
      rruleOptions.until = new Date(event.endDate); // Recurrence ends on this date
    }*/

    return rruleOptions;
  };

  // Map events to FullCalendar format
  const calendarEvents = events.map((event) => {
    const isUserCreator = user._id === event.createdBy._id;
    const isUserOrganizer = event.organizers.some(organizer => organizer._id === user._id);
    const isUserAttendee = event.attendees.some(attendee => attendee._id === user._id);
  
    if (
      event.visibility === 'Public' ||
      event.visibility === 'Private' && (isUserCreator || isUserOrganizer || isUserAttendee) ||
      user.email === process.env.REACT_APP_ADMIN_EMAIL
    ) {
      const startDate = new Date(event.startDate);
      let endDate = new Date(event.endDate);

      // Add 1 day to endDate ONLY for all-day events
      if (event.allDay) {
        endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000); // +1 day
      }

      // Format dates to YYYY-MM-DD for all-day events (avoids timezone issues)
      const startStr = event.allDay ? 
        startDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Hong_Kong' }) : 
        event.startDate;
      const endStr = event.allDay ? 
        endDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Hong_Kong' }) : 
        event.endDate;

      const isRecurring = event.recurrence !== 'None';
      const rrule = event ? getRRule(event) : null; // Add check to ensure event is defined
  
      return {
        id: event._id,
        title: event.title,
        start: startStr,
        end: endStr,
        allDay: event.allDay,
        backgroundColor: event.color || '',
        //backgroundColor: getStatusColor(event.status),
        groupId: event.groupId || null, // Group recurring events
        extendedProps: { event },
        rrule: isRecurring ? rrule : null,
      };
    }
    return null; // Return null if the event doesn't meet the criteria
  }).filter(event => event !== null); // Filter out null values  

  const headerToolbar = isMobile 
    ? {
        start: 'prev,today,next',
        center: 'title',
        end: 'dayGridMonth,listMonth',
      }
    : {
        start: 'prevYear,prev,today,next,nextYear',
        center: 'title',
        end: 'multiMonthYear,dayGridMonth,dayGridWeek,dayGridDay,listYear,listMonth,listWeek,listDay',
      };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedEvents([]);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleAddEvent = async (newEvent) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/event`, newEvent);
      setEvents((prevEvents) => [...prevEvents, response.data]);
      setCreateFormOpen(false);
      return true;
    } catch (error) {
      console.error('Error adding event:', error.message);
      return false;
    }
  };

  const handleSaveEvent = async (updatedEvent) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_SERVER_HOST}/api/event/${updatedEvent._id}`, updatedEvent);
      
      // Update event in local state
      setEvents((prevEvents) =>
        prevEvents.map(event => event._id === updatedEvent._id ? response.data : event)
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const onConfirmDelete = async () => {
    try {
      const response = await axios.delete(`${process.env.REACT_APP_SERVER_HOST}/api/event/${selectedEvent._id}`, selectedEvent);
      
      // Remove event from local state
      setEvents((prevEvents) => prevEvents.filter(event => event._id !== selectedEvent._id));
      
      alertRef.current.displayAlert('success', t('deleteSuccess'));
      setOpenConfirmDeleteDialog(false);
      setEditDialogOpen(false);
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      alertRef.current.displayAlert('error', t('deleteFail'));
      throw error;
    }
  };

  const onCancelDelete = () => {
    setOpenConfirmDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <div>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Skeleton variant="rounded" width={150} height={40} />
          <Skeleton variant="rounded" width={150} height={40} />
        </Stack>
        <Grid container spacing={1} style={{ marginTop: '20px' }}>
          {Array.from(new Array(35)).map((_, index) => (
            <Grid item xs={12 / 7} key={index}>
              <Skeleton variant="rounded" width="100%" height={100} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" width={100} height={40} style={{ marginTop: '20px' }} />
      </div>
    );
  }

  return (
    <MainContent pageTitle={t('calendar')} breadcrumbItems={breadcrumbItems}>
      {project && (
        <Paper variant="outlined" style={{ padding: isMobile ? '0.5rem' : '1rem' }}>
          <Typography variant="body1">{t('numOfEvents')}{t('colon')}{events.length}</Typography>
          
          <div className="event-calendar">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, listPlugin, multiMonthPlugin, rrulePlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              displayEventTime={!events.allDay}
              dayMaxEventRows={5}
              editable={true}
              droppable={true}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: false
              }}
              headerToolbar={headerToolbar}
              buttonText={{
                today: t('today'),
                year: t('year'),
                month: t('month'),
                week: t('week'),
                day: t('day'),
                listDay: t('listDay'),
                listWeek: t('listWeek'),
                listMonth: t('listMonth'),
                listYear: t('listYear'),
              }}
              height="auto"
              eventContent={renderEventContent}
              timeZone="local"
              locale={i18n.language === 'en-us' ? 'en' : 'cn'}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveChanges}
              disabled={eventUpdates.length === 0}
              style={{ marginTop: '20px' }}
            >
              {t('save')}
            </Button>

            {/*<CDialog
              open={dialogOpen}
              onClose={handleClose}
              title={t('event')}
            >
              <ListTableSwitcher
                project={project}
                tasks={selectedEvents}
                setTasks={setSelectedEvents}
                displayProjectSelector={true}
                displayMilestoneSelector={true}
              />
            </CDialog>*/}

            {selectedEvent && (
              <EventDialog
                projectId={projectId}
                open={editDialogOpen}
                onClose={handleEditClose}
                onSubmit={handleSaveEvent}
                onDelete={() => setOpenConfirmDeleteDialog(true)}
                initialData = {selectedEvent}
                mode="update"
              />
            )}

            {createFormOpen && (
              <EventDialog
                projectId={projectId}
                open={createFormOpen}
                onClose={() => setCreateFormOpen(false)}
                onSubmit={handleAddEvent}
                onDelete={() => setOpenConfirmDeleteDialog(true)}
                initialData = {selectedEvent}
                mode="create"
                defaultStartDate={selectedDate}
                defaultEndDate={selectedDate}
              />
            )}

            <ConfirmDeleteDialog
              title={t('deleteEvent')}
              content={t('deleteEventConfirm')}
              open={openConfirmDeleteDialog}
              onCancel={onCancelDelete}
              onConfirm={onConfirmDelete}
            />

            <CAlert ref={alertRef} />

            <EventPopper
              event={selectedEventForPopper}
              anchorEl={popperAnchorEl}
              open={popperOpen}
            />
          </div>
        </Paper>
      )}
      
      <CreateEventBtn />
    </MainContent>
  );
};

export default ProjectCalendar;