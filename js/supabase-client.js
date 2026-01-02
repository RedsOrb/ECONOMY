// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SupabaseClient = {
    user: null,

    init: async function () {
        const { data: { user } } = await supabase.auth.getUser();
        this.user = user;

        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.user = session.user;
                console.log('User signed in:', this.user);
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
                console.log('User signed out');
            }
        });
    },

    signInWithGoogle: async function () {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.href
            }
        });
        if (error) console.error('Error logging in:', error);
    },

    signInWithUsername: async function (username) {
        // For this simple implementation, we might just update the user metadata
        // after Google login, or specific flow. 
        // But requirements say: "add the user to full there username in below it login with google"
        // This implies link username to the auth.

        // Since we are using Google Auth, we can update the user metadata with the username
        if (!this.user) return;

        const { data, error } = await supabase
            .from('profiles')
            .upsert({ id: this.user.id, username: username });

        if (error) {
            console.error('Error updating username:', error);
            return { error };
        }
        return { data };
    },

    saveScore: async function (score) {
        if (!this.user) return;

        const { data, error } = await supabase
            .from('scores')
            .insert([
                { user_id: this.user.id, score: score }
            ]);

        if (error) console.error('Error saving score:', error);
        else console.log('Score saved:', data);
    },

    getLeaderboard: async function () {
        const { data, error } = await supabase
            .from('scores')
            .select(`
                score,
                profiles (username)
            `)
            .order('score', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return [];
        }
        return data;
    },

    signOut: async function () {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error signing out:', error);
        else window.location.reload();
    }
};

// Initialize on load
window.addEventListener('load', () => {
    SupabaseClient.init();
});
