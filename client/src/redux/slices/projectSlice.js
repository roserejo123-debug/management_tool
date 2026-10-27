import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/axiosInstance';

// ─── Async Thunks ─────────────────────────────

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const { data } = await API.get(`/projects${query ? `?${query}` : ''}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const fetchProject = createAsyncThunk(
  'projects/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/projects/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch project');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (projectData, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/projects', projectData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, ...updates }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/projects/${id}`, updates);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/projects/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete project');
    }
  }
);

// ─── Initial State ─────────────────────────────
const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

// ─── Slice ─────────────────────────────────────
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    // Fetch all
    builder
      .addCase(fetchProjects.pending, handlePending)
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.projects;
      })
      .addCase(fetchProjects.rejected, handleRejected);

    // Fetch one
    builder
      .addCase(fetchProject.pending, handlePending)
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload.project;
      })
      .addCase(fetchProject.rejected, handleRejected);

    // Create
    builder
      .addCase(createProject.pending, handlePending)
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.unshift({ ...action.payload.project, taskCounts: { total: 0, todo: 0, inProgress: 0, done: 0 } });
      })
      .addCase(createProject.rejected, handleRejected);

    // Update
    builder
      .addCase(updateProject.pending, handlePending)
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.projects.findIndex((p) => p._id === action.payload.project._id);
        if (idx !== -1) {
          state.projects[idx] = { ...state.projects[idx], ...action.payload.project };
        }
        if (state.currentProject?._id === action.payload.project._id) {
          state.currentProject = { ...state.currentProject, ...action.payload.project };
        }
      })
      .addCase(updateProject.rejected, handleRejected);

    // Delete
    builder
      .addCase(deleteProject.pending, handlePending)
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProject.rejected, handleRejected);
  },
});

export const { clearProjectError, clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
