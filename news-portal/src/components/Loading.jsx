const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
      <div className="spinner mb-4"></div>
      <p className="text-editorial-primary font-medium">{message}</p>
    </div>
  );
};

export default Loading;
