import { getCategory,getMoreCategory } from "@/app/action/category-action";
import ClientNavbarWrapper from "./client-navbar-wrapper";

export default async function NavbarWrapper() {
  const category = await getCategory();
  const Morecategory = await getMoreCategory()
  return <ClientNavbarWrapper category={category} MoreCategory={Morecategory} />;
}