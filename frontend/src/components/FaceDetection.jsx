const detectFaces = async (photo) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/detect`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Detection failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    // Replace console.error with user-friendly error handling
    setError('Face detection failed. Please try again.');
    return null;
  }
} 