export function Card({ children, className="" }) {
    return (
      <div className={`bg-[#101010] rounded-lg shadow p-4 ${className}`}>
        {children}
      </div>
    );
  }

  export function CardHeader({ children, className = "" }) {
    return <div className={`mb-2 ${className}`}>{children}</div>;
  }
  
  export function CardTitle({ children, className = "", ...props }) {
    return <h3 className={`text-lg font-medium ${className || ''}`} {...props}>{children}</h3>;
  }
  
  export function CardContent({ children, className = "" }) {
    return <div className={`${className}`}>{children}</div>;
  }
  
  