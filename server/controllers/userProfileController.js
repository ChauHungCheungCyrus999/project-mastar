const User = require('../models/user');
const UserProfile = require('../models/userProfile');

// Save views
exports.storeUserProfile = async (req, res) => {
  const { userId, language, theme, primaryColor, componentSize, views, dashboardPinState, showTaskDetails } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let userProfile = await UserProfile.findOne({ user: userId });

    if (!userProfile) {
      userProfile = new UserProfile({
        user: userId,
        language,
        theme,
        primaryColor,
        componentSize,
        dataGridViews: views,
        dashboardPinState,
        showTaskDetails
      });
    } else {
      userProfile.language = language;
      userProfile.theme = theme;
      userProfile.primaryColor = primaryColor;
      userProfile.componentSize = componentSize;
      userProfile.dataGridViews = views;
      userProfile.dashboardPinState = dashboardPinState;
      userProfile.showTaskDetails = showTaskDetails;
    }

    await userProfile.save();

    res.status(200).json({ message: 'User profile stored successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to store user profile', error: error.message });
  }
};

exports.retrieveUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const userProfile = await UserProfile.findOne({ user: userId });

    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.status(200).json({
      language: userProfile.language,
      theme: userProfile.theme,
      primaryColor: userProfile.primaryColor,
      componentSize: userProfile.componentSize,
      views: userProfile.dataGridViews,
      dashboardPinState: userProfile.dashboardPinState,
      showTaskDetails: userProfile.showTaskDetails
    || [] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve user profile', error: error.message });
  }
};