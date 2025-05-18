import settingsRoutes from './routes/settingsRoutes';

// Routes
app.use('/api/users', userRoutes);
app.use('/api/brain-teasers', brainTeaserRoutes);
app.use('/api/game-state', gameStateRoutes);
app.use('/api/settings', settingsRoutes); 