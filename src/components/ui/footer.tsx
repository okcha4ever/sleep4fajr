import { ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <div className="mt-auto px-2">
      <footer className="py-4 border-t text-center">
        <a
          href="https://aminedevs.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-primary hover:underline"
        >
          Visit My Portfolio
          <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      </footer>
    </div>
  );
};

export default Footer;
