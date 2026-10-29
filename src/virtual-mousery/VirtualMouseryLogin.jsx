import React,{useState}from 'react';
import{useNavigate,Link as RouterLink}from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import logo from './Virtual-Mousery-Logo.png';
import{Mail,Lock,Eye,EyeOff,AlertCircle,Loader2}from 'lucide-react';

const VirtualMouseryLogin=({onSuccess})=>{
    const navigate=useNavigate();
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [loading,setLoading]=useState(false);
    const [error,setError]=useState('');
    const [visible,setVisible]=useState(false);

    const handleSubmit=async(e)=>{
        e.preventDefault();
        setLoading(true);
        setError('');
        try{
            const response=await axios.post(`${API_BASE_URL}/auth/login`,{email,password,keepSignedIn:false});
            if(response.data?.maintenanceActive){
                setError(response.data.message||'System is under maintenance.');
                setLoading(false);
                return;
            }
            localStorage.setItem('userId', response.data.userProfile?.id);
            onSuccess(response.data.token);
            const dashboardPath = localStorage.getItem('virtualMouseryName') ? '/virtual-mousery/dashboard' : '/virtual-mousery/name-setup';
navigate(dashboardPath);
        }catch(err){
            // DEBUG: Show full error object structure
            console.log('LOGIN DEBUG: Full error object:', err);
            console.log('LOGIN DEBUG: err.message:', err.message);
            console.log('LOGIN DEBUG: err.name:', err.name);
            console.log('LOGIN DEBUG: err.code:', err.code);
            console.log('LOGIN DEBUG: err.stack:', err.stack?.substring(0, 200));
            
            // Axios errors have response property, non-Axios (like network errors) may not
            const status = err.response?.status;
            const data = err.response?.data;
            const message = err.response?.data?.message;
            
            // Also log the config to see what URL was attempted
            console.log('LOGIN DEBUG: err.config URL:', err.config?.url);
            console.log('LOGIN DEBUG: API_BASE_URL used:', API_BASE_URL);
            
            const finalMessage = message || (status===401?'Invalid email or password.':'Login failed.');
            setError(finalMessage);
            setLoading(false);
        }
    };

    return(
        <div className="min-h-screen bg-page-bg dark:bg-dark-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="rounded-xl bg-white dark:bg-dark-card-bg p-8 shadow-lg border border-gray-200 dark:border-dark-border">
                    <div className="text-center mb-6">

                        <img
                    src={logo}
                    alt="Virtual Mousery Logo"
                    className="h-32 w-auto mx-auto"
                  />
                        <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">Login with your crittertrack account</p>
                    </div>
                    {error &&(
                        <div className="mb-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <AlertCircle size={16}/>
                            <span>{error}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-dark-text">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" required className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-dark-text-muted bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-dark-text">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type={visible ? 'text' : 'password'} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter your password" required className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-dark-text-muted bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"/>
                                <button type="button" onClick={()=>setVisible(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 font-semibold text-white bg-primary rounded-lg transition hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">{loading ? <><Loader2 size={18} className="animate-spin"/> Signing in...</> : 'Sign in'}</button>
                    </form>
                    <p className="text-xs text-gray-400 dark:text-dark-text-secondary mt-6 text-center">No account yet? <RouterLink to="/" className="text-primary dark:text-primary-dark hover:underline">Return to crittertrack</RouterLink></p>
                </div>
            </div>
            <div className="hidden md:block w-1/2 ml-8">
                <div className="bg-gray-50 dark:bg-dark-card-bg rounded-xl p-6 border border-gray-200 dark:border-dark-border">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-4">What is Virtual Mousery?</h2>
                    <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed">
                        VirtualMousery is a digital pet simulation game where you adopt, care for, and interact with virtual mice. Feed them, play with them, watch them grow, and customize their habitats. Collect different mouse breeds, decorate their rooms, and compete with friends in fun mini-games and challenges.
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-dark-text-secondary">
                        <li>Adopt and care for virtual mice</li>
                        <li>Customize habitats and accessories</li>
                        <li>Play mini-games and activities</li>
                        <li>Collect rare breeds</li>
                        <li>Track your mouse's growth and stats</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default VirtualMouseryLogin;
