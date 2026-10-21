import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import API from '../../utils/axiosInstance';

const getError = (error, fallback) => error.response?.data?.message || fallback;

export const fetchWishlist = createAsyncThunk(
  'interactions/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/wishlist');
      return data.properties;
    } catch (error) {
      return rejectWithValue(getError(error, 'Unable to load your wishlist.'));
    }
  }
);

export const addWishlistProperty = createAsyncThunk(
  'interactions/addWishlistProperty',
  async (propertyId, { rejectWithValue }) => {
    try {
      const { data } = await API.post(`/wishlist/${propertyId}`);
      return { propertyId, message: data.message };
    } catch (error) {
      return rejectWithValue(getError(error, 'Unable to save this property.'));
    }
  }
);

export const removeWishlistProperty = createAsyncThunk(
  'interactions/removeWishlistProperty',
  async (propertyId, { rejectWithValue }) => {
    try {
      const { data } = await API.delete(`/wishlist/${propertyId}`);
      return { propertyId, message: data.message };
    } catch (error) {
      return rejectWithValue(getError(error, 'Unable to remove this property.'));
    }
  }
);

export const fetchBookings = createAsyncThunk(
  'interactions/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/bookings');
      return data.bookings;
    } catch (error) {
      return rejectWithValue(getError(error, 'Unable to load bookings.'));
    }
  }
);

export const createBooking = createAsyncThunk(
  'interactions/createBooking',
  async (booking, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/bookings', booking);
      return data;
    } catch (error) {
      return rejectWithValue(getError(error, 'Unable to request a visit.'));
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'interactions/updateBookingStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await API.patch(`/bookings/${id}/status`, { status });
      return data;
    } catch (error) {
      return rejectWithValue(getError(error, 'Unable to update this booking.'));
    }
  }
);

export const fetchEnquiries = createAsyncThunk(
  'interactions/fetchEnquiries',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get('/enquiries');
      return data.enquiries;
    } catch (error) {
      return rejectWithValue(getError(error, 'Unable to load enquiries.'));
    }
  }
);

export const createEnquiry = createAsyncThunk(
  'interactions/createEnquiry',
  async (enquiry, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/enquiries', enquiry);
      return data;
    } catch (error) {
      return rejectWithValue(getError(error, 'Unable to send your enquiry.'));
    }
  }
);

export const fetchPropertyReviews = createAsyncThunk(
  'interactions/fetchPropertyReviews',
  async (propertyId, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/properties/${propertyId}/reviews`);
      return { propertyId, reviews: data.reviews, averageRating: data.averageRating, reviewCount: data.reviewCount };
    } catch (error) {
      return rejectWithValue(getError(error, 'Unable to load property reviews.'));
    }
  }
);

export const createPropertyReview = createAsyncThunk(
  'interactions/createPropertyReview',
  async ({ propertyId, rating, comment }, { rejectWithValue }) => {
    try {
      const { data } = await API.post(`/properties/${propertyId}/reviews`, { rating, comment });
      return { propertyId, review: data.review };
    } catch (error) {
      return rejectWithValue(getError(error, 'Unable to submit your review.'));
    }
  }
);

const initialState = {
  wishlist: [],
  bookings: [],
  enquiries: [],
  propertyReviews: [],
  reviewSummary: { averageRating: 0, reviewCount: 0 },
  reviewsPropertyId: null,
  loading: false,
  actionLoading: false,
  error: null,
};

const interactionSlice = createSlice({
  name: 'interactions',
  initialState,
  reducers: {
    clearInteractionError(state) {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addWishlistProperty.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(addWishlistProperty.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.error = null;
        if (!state.wishlist.some((property) => property._id === action.payload.propertyId)) {
          state.wishlist.push({ _id: action.payload.propertyId });
        }
      })
      .addCase(addWishlistProperty.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      .addCase(removeWishlistProperty.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(removeWishlistProperty.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.error = null;
        state.wishlist = state.wishlist.filter((property) => property._id !== action.payload.propertyId);
      })
      .addCase(removeWishlistProperty.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      .addCase(fetchBookings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createBooking.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.bookings.unshift(action.payload.booking);
      })
      .addCase(createBooking.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      .addCase(updateBookingStatus.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.bookings = state.bookings.map((booking) =>
          booking._id === action.payload.booking._id ? action.payload.booking : booking
        );
      })
      .addCase(updateBookingStatus.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; })
      .addCase(fetchEnquiries.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEnquiries.fulfilled, (state, action) => {
        state.loading = false;
        state.enquiries = action.payload;
      })
      .addCase(fetchEnquiries.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createEnquiry.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(createEnquiry.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.enquiries.unshift(action.payload.enquiry);
      })
      .addCase(createEnquiry.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });
    builder
      .addCase(fetchPropertyReviews.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPropertyReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviewsPropertyId = action.payload.propertyId;
        state.propertyReviews = action.payload.reviews;
        state.reviewSummary = {
          averageRating: action.payload.averageRating,
          reviewCount: action.payload.reviewCount,
        };
      })
      .addCase(fetchPropertyReviews.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createPropertyReview.pending, (state) => { state.actionLoading = true; state.error = null; })
      .addCase(createPropertyReview.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.propertyReviews.unshift(action.payload.review);
        state.reviewSummary.reviewCount += 1;
        state.reviewSummary.averageRating = Math.round((
          state.propertyReviews.reduce((sum, review) => sum + review.rating, 0) / state.propertyReviews.length
        ) * 10) / 10;
      })
      .addCase(createPropertyReview.rejected, (state, action) => { state.actionLoading = false; state.error = action.payload; });
  },
});

export const { clearInteractionError } = interactionSlice.actions;
export default interactionSlice.reducer;
