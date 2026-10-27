import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/axiosInstance';

// ─── Async Thunks ─────────────────────────────

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (projectId, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/projects/${projectId}/tasks`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async ({ projectId, ...taskData }, { rejectWithValue }) => {
    try {
      const { data } = await API.post(`/projects/${projectId}/tasks`, taskData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, ...updates }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/tasks/${id}`, updates);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/tasks/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete task');
    }
  }
);

// ─── Initial State ─────────────────────────────
const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

// ─── Slice ─────────────────────────────────────
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
    clearTasks: (state) => {
      state.tasks = [];
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

    // Fetch all tasks for a project
    builder
      .addCase(fetchTasks.pending, handlePending)
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
      })
      .addCase(fetchTasks.rejected, handleRejected);

    // Create task
    builder
      .addCase(createTask.pending, handlePending)
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload.task);
      })
      .addCase(createTask.rejected, handleRejected);

    // Update task
    builder
      .addCase(updateTask.pending, handlePending)
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.tasks.findIndex((t) => t._id === action.payload.task._id);
        if (idx !== -1) {
          state.tasks[idx] = action.payload.task;
        }
      })
      .addCase(updateTask.rejected, handleRejected);

    // Delete task
    builder
      .addCase(deleteTask.pending, handlePending)
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      })
      .addCase(deleteTask.rejected, handleRejected);
  },
});

export const { clearTaskError, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;
