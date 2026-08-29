document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('productForm');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('image-preview');
    const uploadText = document.getElementById('upload-text');
    const messageDiv = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');

    // Handle image preview
    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            
            uploadText.style.display = 'none';
            imagePreview.style.display = 'block';
            
            reader.addEventListener('load', function() {
                imagePreview.setAttribute('src', this.result);
            });
            
            reader.readAsDataURL(file);
        } else {
            uploadText.style.display = 'block';
            imagePreview.style.display = 'none';
            imagePreview.setAttribute('src', '');
        }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Disable button to prevent double submission
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';
        
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showMessage('Product uploaded successfully!', 'success');
                form.reset();
                uploadText.style.display = 'block';
                imagePreview.style.display = 'none';
                imagePreview.setAttribute('src', '');
            } else {
                showMessage(result.error || 'Failed to upload product.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('An error occurred while uploading. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Upload Product';
        }
    });
    
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = type;
        messageDiv.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
});
