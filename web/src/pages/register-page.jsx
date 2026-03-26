import { useState, useEffect } from "react";
import { Layout } from "../components/ui";
import { RegisterForm } from "../components/auth";

function RegisterPage() {
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setOpacity(1);
        }, 300);

        return () => clearTimeout(timer);
    } , []);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{width: '100%', minHeight: 'calc(100vh - 32px)'}}>
            <div className="d-flex flex-column justify-content-center rounded-4 pt-3 pb-3" style={{width: '500px', height: 'auto', backgroundColor: '#202020', opacity: opacity, transition: 'opacity 1s ease'}}>
                <Layout>
                    <RegisterForm />
                </Layout>
            </div>
        </div>
    );
}

export default RegisterPage;