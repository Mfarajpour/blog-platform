const { createApp, ref, reactive, onMounted } = Vue;

const API_URL = 'http://91.107.243.217:5000'; 

createApp({
    setup() {
        // --- State ---
        const currentView = ref('home');
        const posts = ref([]);
        const selectedPost = ref(null);
        const loading = ref(false);
        const errorMessage = ref('');
        const creatingPost = ref(false);
        const uploadingImage = ref(false);
        
        const token = ref(localStorage.getItem('token'));
        const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));

        // --- Forms ---
        const loginForm = reactive({
            username: '',
            password: ''
        });

        const registerForm = reactive({
            username: '',
            email: '',
            password: ''
        });
        
        const postForm = reactive({ 
            title: '', 
            content: '' 
        });

        // --- Methods ---

        // 1. Auth
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
                console.error(error);
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
                console.error(error);
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

        // 2. Blog Logic
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
                const imageMarkdown = `\n![Image](${imageUrl})\n`;
                postForm.content += imageMarkdown;
            } catch (error) {
                console.error(error);
                alert('Image upload failed');
            } finally {
                uploadingImage.value = false;
                // Allow re-selecting same file
                event.target.value = '';
            }
        };

        // 3. Helpers & Navigation
        const formatDate = (dateString) => {
            if (!dateString) return '';
            return new Date(dateString).toLocaleDateString();
        };

        const viewPost = (post) => {
            selectedPost.value = post;
            currentView.value = 'post';
            window.scrollTo(0, 0);
        };

        const renderMarkdown = (text) => {
            if (!text) return '';
            return marked.parse(text);
        };

        const setView = (viewName) => {
            currentView.value = viewName;
            errorMessage.value = '';
        };

        // Initial Load
        onMounted(() => {
            fetchPosts();
        });

        return {
            // State
            currentView,
            posts,
            selectedPost,
            loading,
            errorMessage,
            token,
            user,
            creatingPost,
            uploadingImage,
            // Forms
            loginForm,
            registerForm,
            postForm,
            // Methods
            setView,
            handleLogin,
            handleRegister,
            handleCreatePost,
            handleImageUpload,
            logout,
            fetchPosts,
            formatDate,
            viewPost,
            renderMarkdown
        };
    }
}).mount('#app');
