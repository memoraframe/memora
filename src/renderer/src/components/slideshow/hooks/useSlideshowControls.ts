// hooks/useSlideshowControls.ts
import { ROUTES } from "@renderer/routes";
import { useSwipeable } from "react-swipeable";
import useKeyboardNavigation from "./useKeyboardNavigation";
import { useNavigate } from "react-router-dom";

type SlideShowControlProps = {
    nextSlide: () => void;
    prevSlide: () => void;
    setShowInformation: (showInformation: boolean) => void;
    showInformation: boolean;
};

const useSlideshowControls = ({
    nextSlide,
    prevSlide,
    setShowInformation,
    showInformation,
}: SlideShowControlProps) => {
    const navigate = useNavigate();

    useKeyboardNavigation(nextSlide, prevSlide);

    const handlers = useSwipeable({
        onSwipedLeft: nextSlide,
        onSwipedRight: prevSlide,
        onTap: (event) => {
            if(event.event.type == "touchend") {
                setShowInformation(!showInformation);
            }
        },
        onSwipedDown: () => {
            navigate(ROUTES.SETTINGS);
        },
        onSwipedUp: () => {
            navigate(ROUTES.MEDIA);
        },
        trackMouse: true,
    });

    return handlers;
};

export default useSlideshowControls;
