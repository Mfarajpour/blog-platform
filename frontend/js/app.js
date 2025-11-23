const { createApp, ref, onMounted } = Vue;

const API_URL = 'http://YOUR_PUBLIC_IP:5000'; // <--- CHANGE THIS TO YOUR SERVER IP

createApp({
    setup() {
        const currentView = ref('home');
        const posts = ref([]);
        const loading = ref(false);
        const token = ref(localStorage.getItem('token'));
        const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));

        // Fetch Public Posts
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
            return new Date(dateString).toLocaleDateString();
        };

        const logout = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            token.value = null;
            user.value = null;
            currentView.value = 'home';
        };
        
        const viewPost = (post) => {
            console.log("Viewing post:", post.slug);
            // We will implement single post view later
        };

        onMounted(() => {
            fetchPosts();
        });

        return {
            currentView,
            posts,
            loading,
            token,
            user,
            formatDate,
            logout,
            viewPost
        };
    }
}).mount('#app');
