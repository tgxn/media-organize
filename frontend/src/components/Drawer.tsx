import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";

const CustomDrawer = (props: any) => {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: 450,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: 450,
                    boxSizing: "border-box",
                },
            }}
            anchor="left">
            <Toolbar />
            {props.element}
        </Drawer>
    );
};

export default CustomDrawer;
