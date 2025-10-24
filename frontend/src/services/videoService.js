import api from './api';

export const videoService = {
  uploadVideo: async (formData, onProgress) => {
    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onProgress) {
          onProgress(percentCompleted);
        }
      }
    });
    return response.data;
  },

  getVideos: async (params = {}) => {
    const response = await api.get('/videos', { params });
    return response.data;
  },

  getVideo: async (id) => {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },

  updateVideo: async (id, data) => {
    const response = await api.put(`/videos/${id}`, data);
    return response.data;
  },

  deleteVideo: async (id) => {
    const response = await api.delete(`/videos/${id}`);
    return response.data;
  },

  getStreamUrl: (id) => {
    const token = localStorage.getItem('token');
    return `${api.defaults.baseURL}/videos/${id}/stream?token=${token}`;
  }
};
