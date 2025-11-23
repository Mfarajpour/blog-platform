const { createApp, ref, reactive, onMounted } = Vue;


const API_URL = 'http://91.107.243.217:5000'; 

createApp({
    setup() {
        // --- State ---
        const currentView = ref('home');
        const posts = ref([]);
        const loading = ref(false);
        const errorMessage = ref('');
        
        const token = ref(localStorage.getItem('token'));
        const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));

        // --- Form Objects (Reactive) ---
    
        const loginForm = reactive({
            username: '',
            password: ''
        });

        const registerForm = reactive({
            username: '',
            email: '',
            password: ''
        });

        // --- Auth Methods ---
        const handleLogin = async () => {
            errorMessage.value = '';
            try {
                const response = await axios.post(`${API_URL}/auth/login`, loginForm);
                
                token.value = response.data.token;
                user.value = response.data.user;
                
                localStorage.setItem('token', token.value);
                localStorage.setItem('user', JSON.stringify(user.value));
                
                currentView.value = 'dashboard';
                
                // Reset form
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
                
                // Reset form
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

        // --- Blog Methods ---
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

        // Initial Load
        onMounted(() => {
            fetchPosts();
        });

        // --- RETURN EVERYTHING ---
        return {
            currentView,
            posts,
            loading,
            errorMessage,
            token,
            user,
            // Forms
            loginForm,
            registerForm,
            // Methods
            setView,
            handleLogin,
            handleRegister,
            logout,
            fetchPosts,
            formatDate,
            viewPost
        };
    }
}).mount('#app');
