import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/axiosInstance';

// ─── Async Thunks ────────────────────────────────

export const fetchProperties = createAsyncThunk(
  'properties/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/properties', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch properties');
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  'properties/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/properties/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Property not found');
    }
  }
);

export const createProperty = createAsyncThunk(
  'properties/create',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/properties', formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create property');
    }
  }
);

export const updateProperty = createAsyncThunk(
  'properties/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/properties/${id}`, formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update property');
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'properties/delete',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/properties/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete property');
    }
  }
);

export const fetchMyProperties = createAsyncThunk(
  'properties/fetchMine',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/properties/my-properties', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch your properties');
    }
  }
);

export const fetchCities = createAsyncThunk(
  'properties/fetchCities',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/properties/cities');
      return data.cities;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const adminFetchAllProperties = createAsyncThunk(
  'properties/adminFetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/properties/admin/all', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const approveProperty = createAsyncThunk(
  'properties/approve',
  async ({ id, isApproved }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/properties/${id}/approve`, { isApproved });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ─── Initial State ──────────────────────────────
const initialState = {
  properties: [],
  selectedProperty: null,
  myProperties: [],
  adminProperties: [],
  cities: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  actionLoading: false,
  error: null,
  message: null,
};

// ─── Slice ──────────────────────────────────────
const propertySlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    clearPropertyMessages: (state) => {
      state.error = null;
      state.message = null;
    },
    clearSelectedProperty: (state) => {
      state.selectedProperty = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchProperties.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.properties;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchProperties.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Fetch by ID
    builder
      .addCase(fetchPropertyById.pending, (state) => { state.loading = true; })
      .addCase(fetchPropertyById.fulfilled, (state, action) => { state.loading = false; state.selectedProperty = action.payload.property; })
      .addCase(fetchPropertyById.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Create
    builder
      .addCase(createProperty.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.message = action.payload.message;
        state.myProperties.unshift(action.payload.property);
      })
      .addCase(createProperty.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });

    // Update
    builder
      .addCase(updateProperty.pending, (state) => { state.actionLoading = true; })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.message = action.payload.message;
        state.selectedProperty = action.payload.property;
        state.myProperties = state.myProperties.map((p) =>
          p._id === action.payload.property._id ? action.payload.property : p
        );
      })
      .addCase(updateProperty.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });

    // Delete
    builder
      .addCase(deleteProperty.pending, (state) => { state.actionLoading = true; })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.myProperties = state.myProperties.filter((p) => p._id !== action.payload);
        state.adminProperties = state.adminProperties.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProperty.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });

    // My Properties
    builder
      .addCase(fetchMyProperties.pending, (state) => { state.loading = true; })
      .addCase(fetchMyProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.myProperties = action.payload.properties;
        state.total = action.payload.total;
      })
      .addCase(fetchMyProperties.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Cities
    builder
      .addCase(fetchCities.fulfilled, (state, action) => { state.cities = action.payload; });

    // Admin All
    builder
      .addCase(adminFetchAllProperties.pending, (state) => { state.loading = true; })
      .addCase(adminFetchAllProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.adminProperties = action.payload.properties;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(adminFetchAllProperties.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // Approve
    builder
      .addCase(approveProperty.fulfilled, (state, action) => {
        state.adminProperties = state.adminProperties.map((p) =>
          p._id === action.payload.property._id ? action.payload.property : p
        );
        state.message = action.payload.message;
      });
  },
});

export const { clearPropertyMessages, clearSelectedProperty } = propertySlice.actions;
export default propertySlice.reducer;
