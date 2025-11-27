import { configureStore } from '@reduxjs/toolkit';
import { propertiesReducer, userReducer, usersReducer, rolesReducer, scrapingReducer, listingsReducer, agentsReducer } from './slices/index.js';

const store = configureStore({
  reducer: {
    properties: propertiesReducer,
    user: userReducer,
    users: usersReducer,
    roles: rolesReducer,
    scraping: scrapingReducer,
    listings: listingsReducer,
    agents: agentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'payload.createdAt', 'payload.updatedAt'],
      },
    }),
});

export { store };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

