const Footer = () => {
  return (
    <footer className="mt-20 py-8 backdrop-blur-lg bg-white/5 border-t border-white/20">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-300">
        <p>© {new Date().getFullYear()} WaifuCore · Girlfriendie</p>
        <nav className="flex items-center gap-4">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Contact</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
