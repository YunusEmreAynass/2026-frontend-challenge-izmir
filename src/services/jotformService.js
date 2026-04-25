import { apiClient } from './apiKey';

const formIds = {
    checkins: import.meta.env.VITE_FORM_ID_CHECKINS,
    messages: import.meta.env.VITE_FORM_ID_MESSAGES,
    sightings: import.meta.env.VITE_FORM_ID_SIGHTINGS,
    personalNotes: import.meta.env.VITE_FORM_ID_PERSONAL_NOTES,
    anonymousTips: import.meta.env.VITE_FORM_ID_ANONYMOUS_TIPS,
};

// Form submission'larını getiren metod
const getSubmissions = async (formId) => {
    try {
        const response = await apiClient.get(`/form/${formId}/submissions`);
        return response; // Interceptor'da direkt data.content dönüldü
    } catch (error) {
        console.error(`Error fetching submissions for form ${formId}:`, error);
        throw error;
    }
};

export const jotformService = {
    getCheckins: () => getSubmissions(formIds.checkins),
    getMessages: () => getSubmissions(formIds.messages),
    getSightings: () => getSubmissions(formIds.sightings),
    getPersonalNotes: () => getSubmissions(formIds.personalNotes),
    getAnonymousTips: () => getSubmissions(formIds.anonymousTips),

    // Tüm verileri asenkron olarak paralel yüklemek için yararlı metod
    getAllData: async () => {
        const [checkins, messages, sightings, personalNotes, anonymousTips] = await Promise.all([
            getSubmissions(formIds.checkins),
            getSubmissions(formIds.messages),
            getSubmissions(formIds.sightings),
            getSubmissions(formIds.personalNotes),
            getSubmissions(formIds.anonymousTips)
        ]);

        return {
            checkins,
            messages,
            sightings,
            personalNotes,
            anonymousTips
        };
    }
};
