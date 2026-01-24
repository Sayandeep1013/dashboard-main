import MissionComponent from "@/components/mission/missionTable";
import { Sidebar } from "@/components/ui/sidebar";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

const MissionPage = () => {
    return (
        <div className={`page bg-light ${inter.className} font-sans`}>
            <Sidebar />
            <div className="page-wrapper" style={{ marginLeft: "250px" }}>
                {/* teacher type is 5 */}
                <MissionComponent user_type={5} />
            </div>
        </div>
    );
};

export default MissionPage;