import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../config/supabaseClient";

export default function Login() {
    const [setWindowWidth] = useState(window.innerWidth);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                navigate('/Profile');
            }
        };
        checkUser();
    }, [navigate]);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Email validation
    const isValidEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return emailRegex.test(email);
    };

    const handleSignUp = async () => {
        if (!isValidEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        created_at: new Date().toISOString()
                    }
                }
            });

            if (error) throw error;

            setMessage("Please check your email to verify your account");
        } catch (error) {
            setError(error.message);
        }
    };

    const handleSignIn = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            if (data.user) {
                setMessage("Login successful!");
                navigate('/profile'); // Redirect to notes page after login
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleForgotPassword = async () => {
        const { error } = await supabase.auth.api.resetPasswordForEmail(email);

        if (error) {
            setError("Error sending password reset email. Try again.");
        } else {
            setMessage("Password reset email sent. Check your inbox.");
            setError(null);
        }
    };

    return (
        <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-lg rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-6">
                {isSignUp ? "Create an Account" : isForgotPassword ? "Reset Password" : "Welcome Back"}
            </h1>

            {/* Form */}
            <div className="space-y-4">
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-3 px-4 bg-gray-700 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {!isForgotPassword && (
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full py-3 px-4 bg-gray-700 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-4">
                {isForgotPassword ? (
                    <button
                        onClick={handleForgotPassword}
                        className="w-full py-3 bg-green-600 rounded-lg hover:bg-green-700 transition focus:ring-2 focus:ring-green-400"
                    >
                        Send Reset Email
                    </button>
                ) : (
                    <button
                        onClick={isSignUp ? handleSignUp : handleSignIn}
                        className="w-full py-3 bg-green-600 rounded-lg hover:bg-green-700 transition focus:ring-2 focus:ring-green-400"
                    >
                        {isSignUp ? "Sign Up" : "Sign In"}
                    </button>
                )}
            </div>

            {/* Error and Success Messages */}
            {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
            {message && <p className="mt-4 text-green-400 text-sm">{message}</p>}

            {/* Toggle Links */}
            <div className="mt-6 text-center">
                {isForgotPassword ? (
                    <button
                        onClick={() => setIsForgotPassword(false)}
                        className="text-green-400 hover:underline"
                    >
                        Back to Login
                    </button>
                ) : (
                    <div>
                        <button
                            onClick={() => setIsForgotPassword(true)}
                            className="text-green-400 hover:underline"
                        >
                            Forgot Password?
                        </button>
                        <p className="mt-2">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-green-400 hover:underline"
                            >
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
