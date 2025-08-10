const Footer = () => {
  return (
    <footer className="mt-20 py-8 border-t">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
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
