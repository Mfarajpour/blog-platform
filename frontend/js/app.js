const { createApp, ref, reactive, onMounted } = Vue;

const API_URL = 'http://91.107.243.217:5000'; 

createApp({
    setup() {
        // --- State ---
        const currentView = ref('home');
        const posts = ref([]);
        const loading = ref(false);
        const errorMessage = ref('');
        const creatingPost = ref(false);
        const uploadingImage = ref(false); 
        
        const token = ref(localStorage.getItem('token'));
        const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));

        // --- Forms ---
        const loginForm = reactive({ username: '', password: '' });
        const registerForm = reactive({ username: '', email: '', password: '' });
        const postForm = reactive({ title: '', content: '' });

        // --- Methods ---

        // NEW: Handle Image Upload
        const handleImageUpload = async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            uploadingImage.value = true;
            const formData = new FormData();
            formData.append('file', file);

            try {
                const headers = { 
                    'Authorization': `Bearer ${token.value}`,
                    'Content-Type': 'multipart/form-data'
                };
                
                const response = await axios.post(`${API_URL}/upload/`, formData, { headers });
                const imageUrl = response.data.url;

                // Append markdown to content
                const imageMarkdown = `\n![Image](${imageUrl})\n`;
                postForm.content += imageMarkdown;
                
            } catch (error) {
                console.error(error);
                alert('Image upload failed');
            } finally {
                uploadingImage.value = false;
                // Reset input value to allow re-uploading same file if needed
                event.target.value = '';
            }
        };

        const handleCreatePost = async () => {
            if (!token.value) return;
            creatingPost.value = true;
            errorMessage.value = '';
            try {
                const headers = { Authorization: `Bearer ${token.value}` };
                await axios.post(`${API_URL}/blog/posts`, postForm, { headers });
                alert('Post published successfully!');
                postForm.title = '';
                postForm.content = '';
                fetchPosts();
                currentView.value = 'home';
            } catch (error) {
                console.error(error);
                alert('Failed to publish post.');
            } finally {
                creatingPost.value = false;
            }
        };

        const handleLogin = async () => {
            errorMessage.value = '';
            try {
                const response = await axios.post(`${API_URL}/auth/login`, loginForm);
                token.value = response.data.token;
                user.value = response.data.user;
                localStorage.setItem('token', token.value);
                localStorage.setItem('user', JSON.stringify(user.value));
                currentView.value = 'dashboard';
                loginForm.username = '';
                loginForm.password = '';
            } catch (error) {
                errorMessage.value = error.response?.data?.error || 'Login failed';
            }
        };

        const handleRegister = async () => {
            errorMessage.value = '';
            try {
                await axios.post(`${API_URL}/auth/register`, registerForm);
                alert('Registration successful! Please login.');
                currentView.value = 'login';
                registerForm.username = '';
                registerForm.email = '';
                registerForm.password = '';
            } catch (error) {
                errorMessage.value = error.response?.data?.error || 'Registration failed';
            }
        };

        const logout = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            token.value = null;
            user.value = null;
            currentView.value = 'home';
        };

        const fetchPosts = async () => {
            loading.value = true;
            try {
                const response = await axios.get(`${API_URL}/blog/posts`);
                posts.value = response.data;
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                loading.value = false;
            }
        };

        const formatDate = (dateString) => {
            if (!dateString) return '';
            return new Date(dateString).toLocaleDateString();
        };

        const viewPost = (post) => {
            console.log("View post:", post);
        };

        const setView = (viewName) => {
            currentView.value = viewName;
            errorMessage.value = '';
        };

        onMounted(() => {
            fetchPosts();
        });

        return {
            currentView,
            posts,
            loading,
            errorMessage,
            token,
            user,
            loginForm,
            registerForm,
            postForm,
            creatingPost,
            uploadingImage, 
            setView,
            handleLogin,
            handleRegister,
            handleCreatePost,
            handleImageUpload, 
            logout,
            fetchPosts,
            formatDate,
            viewPost
        };
    }
}).mount('#app');
