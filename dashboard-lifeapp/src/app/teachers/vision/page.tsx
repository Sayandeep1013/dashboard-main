
import { Sidebar } from "@/components/ui/sidebar";
import VisionSessionsComponent from "@/components/vision/visionTable";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

const VisionSessionsPage = () => {
  return (
    <div className={`page bg-light ${inter.className} font-sans`}>
      <Sidebar />
      <div className="page-wrapper" style={{ marginLeft: "250px" }}>
        {/* user_type = 5 for teacher */}
        <VisionSessionsComponent user_type={5} />
      </div>
    </div>
  )
}


export default VisionSessionsPage