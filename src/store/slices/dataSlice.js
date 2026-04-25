import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jotformService } from '../../services/jotformService';
import { extractJotformAnswers, normalizeDateObjToTimestamp } from '../../utils/normalization';

// Asenkron veri çekme işlemi (Thunk)
export const fetchAllData = createAsyncThunk(
    'data/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await jotformService.getAllData();

            // Gelen verileri işlemek için yardımcı fonksiyon
            const formatSubmissions = (submissionsArray) => {
                if (!Array.isArray(submissionsArray)) return [];
                return submissionsArray.map((sub) => {
                    const formattedAnswers = extractJotformAnswers(sub.answers);
                    return {
                        id: sub.id,
                        createdAt: sub.created_at,
                        timestamp: formattedAnswers.date || formattedAnswers.time || sub.created_at, // En mantıklı zaman damgası
                        ...formattedAnswers,
                        _rawObjDate: normalizeDateObjToTimestamp(formattedAnswers.date || formattedAnswers.time || sub.created_at)
                    };
                }).sort((a, b) => b._rawObjDate - a._rawObjDate); // Yeniden eskiye sıralama (Varsayılan)
            };

            return {
                checkins: formatSubmissions(response.checkins),
                messages: formatSubmissions(response.messages),
                sightings: formatSubmissions(response.sightings),
                personalNotes: formatSubmissions(response.personalNotes),
                anonymousTips: formatSubmissions(response.anonymousTips),
            };
        } catch (error) {
            return rejectWithValue(error.message || 'Veriler yüklenirken bir hata oluştu');
        }
    }
);

const initialState = {
    checkins: [],
    messages: [],
    sightings: [],
    personalNotes: [],
    anonymousTips: [],
    isLoading: false,
    error: null,
};

const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllData.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.checkins = action.payload.checkins;
                state.messages = action.payload.messages;
                state.sightings = action.payload.sightings;
                state.personalNotes = action.payload.personalNotes;
                state.anonymousTips = action.payload.anonymousTips;
            })
            .addCase(fetchAllData.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export default dataSlice.reducer;
