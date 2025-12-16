import * as React from 'react';
import {
  CssBaseline, useTheme, Grid, Stack,
  Box, Container, Paper, Tabs, Tab,
  Typography, TextField, InputAdornment, Avatar,
  List, ListItem, ListItemText,
  Accordion, AccordionDetails, AccordionSummary
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ExpandMore, Search, Home, Folder, Group, SupportAgent, Phone, Email } from '@mui/icons-material';
import { useMediaQuery } from '@mui/material';

export default function HelpFaq() {
  const theme = useTheme();
  const { t } = useTranslation();

  const [expanded, setExpanded] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('general');
  const [searchTerm, setSearchTerm] = React.useState('');
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleCategoryChange = (category) => () => {
    setSelectedCategory(category);
    setSearchTerm('');
  };

  const handleSearchChange = (event) => {
    setSelectedCategory('');
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleSearchClick = () => {
    setSelectedCategory('');
  };

  const faqData = {
    general: [
      {
        panel: 'panel1',
        question: t('whatIsProjectMastar'),
        answer: t('whatIsProjectMastarAnswer'),
      },
    ],
    projects: [
      {
        panel: 'panel2',
        question: t('howToCreateProject'),
        answer: t('howToCreateProjectAnswer'),
      },
      {
        panel: 'panel3',
        question: t('howToEditProject'),
        answer: t('howToEditProjectAnswer'),
      },
      {
        panel: 'panel4',
        question: t('howToDeleteProject'),
        answer: t('howToDeleteProjectAnswer'),
      },
    ],
    team: [
      {
        panel: 'panel5',
        question: t('howToAddTeamMembers'),
        answer: t('howToAddTeamMembersAnswer'),
      },
      {
        panel: 'panel6',
        question: t('whatRolesCanAssign'),
        answer: t('whatRolesCanAssignAnswer'),
      },
    ],
    support: [
      {
        panel: 'panel7',
        question: t('howToContactSupport'),
        answer: t('howToContactSupportAnswer'),
      },
    ],
  };

  const categories = [
    { key: 'general', label: t('general'), icon: <Home /> },
    { key: 'projects', label: t('projects'), icon: <Folder /> },
    { key: 'team', label: t('team'), icon: <Group /> },
    { key: 'support', label: t('support'), icon: <SupportAgent /> },
  ];

  const filteredFaqData = Object.keys(faqData).reduce((acc, key) => {
    if (selectedCategory === key) {
      acc[key] = faqData[key];
    } else if (selectedCategory === '') {
      const filteredItems = faqData[key].filter((item) =>
        item.question.toLowerCase().includes(searchTerm)
      );
      if (filteredItems.length > 0) {
        acc[key] = filteredItems;
      }
    }
    return acc;
  }, {});

  const selectedCategoryIcon = categories.find((c) => c.key === selectedCategory)?.icon;

  return (
    <>
      <CssBaseline />
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="primary.main" gutterBottom>
          {t('helloHowCanWeHelp')}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {t('chooseCategory')}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <TextField
            autoFocus={true}
            size="small"
            sx={{ width: isMobile ? '100%' : '50%' }}
            placeholder={t('askQuestion')}
            inputProps={{ 'aria-label': t('askQuestion') }}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" size="small">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>
      <Container sx={{ mt: 4 }}>
        {isMobile ? (
          <Tabs
            value={selectedCategory}
            onChange={(event, newValue) => setSelectedCategory(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="category tabs"
          >
            {categories.map((category) => (
              <Tab
                key={category.key}
                label={category.label}
                icon={category.icon}
                value={category.key}
              />
            ))}
          </Tabs>
        ) : (
          <Box sx={{ display: 'table-cell', width: '200px', verticalAlign: 'top' }}>
            <Paper elevation={0} sx={{ bgcolor: theme.palette.background.paper }}>
              <List component="nav">
                {categories.map((category) => (
                  <ListItem
                    button
                    key={category.key}
                    selected={selectedCategory === category.key}
                    onClick={handleCategoryChange(category.key)}
                  >
                    {category.icon}
                    <ListItemText primary={category.label} sx={{ ml: 2 }} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}

        <Box sx={{ display: 'table-cell', paddingTop: isMobile ? 1 : 0, paddingLeft: isMobile ? 0 : 4 }}>
          {Object.keys(filteredFaqData).map((categoryKey) => (
            <Box key={categoryKey} sx={{ mb: 3 }}>
              <Stack alignItems="center" direction="row" gap={2} mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }} variant="rounded">
                  {selectedCategoryIcon}
                </Avatar>
                <Typography variant="subtitle2" gutterBottom>
                  {categories.find((c) => c.key === categoryKey).label}
                </Typography>
              </Stack>
              
              {filteredFaqData[categoryKey].map((item) => (
                <Accordion
                  key={item.panel}
                  expanded={expanded === item.panel}
                  onChange={handleChange(item.panel)}
                  sx={{ width: '100%' }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    aria-controls={`${item.panel}d-content`}
                    id={`${item.panel}d-header`}
                  >
                    <Typography component="h3" variant="body1" color="text.primary">
                      {item.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
        </Box>
      </Container>
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.secondary', mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t('stillHaveQuestion')}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {t('notFoundAnswerContactUs')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: "center",
            justifyContent: 'center',
            mt: 2,
          }}
        >
          <Paper sx={{ p: 2, m: 1, width: '300px', textAlign: 'center', bgcolor: theme.palette.background.paper }}>
            <Grid container justifyContent="center" m={1}>
              <Avatar sx={{ bgcolor: 'primary.main' }} variant="rounded">
                <Phone />
              </Avatar>
            </Grid>
            <Typography variant="body1" gutterBottom>
              {t('contactPhone')}
            </Typography>
            <Typography variant="body2">
              {t('happyToHelp')}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, m: 1, width: '300px', textAlign: 'center', bgcolor: theme.palette.background.paper }}>
            <Grid container justifyContent="center" m={1}>
              <Avatar sx={{ bgcolor: 'primary.main' }} variant="rounded">
                <Email />
              </Avatar>
            </Grid>
            <Typography variant="body1" gutterBottom>
              {t('contactEmail')}
            </Typography>
            <Typography variant="body2">
              {t('bestWayToGetAnswer')}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </>
  );
}