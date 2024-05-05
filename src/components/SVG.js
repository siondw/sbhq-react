import trophy from "../assets/trophy.svg";
import check from "../assets/check.svg";
import gear from "../assets/gear.svg";
import hidepass from "../assets/hidepass.svg";
import leaderboard from "../assets/leaderboard.svg";
import person from "../assets/person.svg";
import triangle from "../assets/triangle.svg";
import x from "../assets/x.svg";
import DollarSignIcon from "../assets/DollarSignIcon.svg";



const MySvgComponent = ({ iconType, width, height, fill }) => {
        let SvgIcon;
    
        switch (iconType) {
            case 'trophy':
                SvgIcon = trophy;
                break;
            case 'check':
                SvgIcon = check;
                break;
            case 'gear':
                SvgIcon = gear;
                break;
            case 'hidepass':
                SvgIcon = hidepass;
                break;
            case 'leaderboard':
                SvgIcon = leaderboard;
                break;
            case 'person':
                SvgIcon = person;
                break;
            case 'triangle':
                SvgIcon = triangle;
                break;
            case 'x':
                SvgIcon = x;
                break;
            case 'DollarSignIcon':
                SvgIcon = DollarSignIcon;
                break;
            default:
                SvgIcon = trophy; // Default icon
                break;
        }
    return (
      <img 
        src={SvgIcon} 
        alt="" 
        style={{ 
          width: width, 
          height: height, 
        }} 
      />
    );
  };
  
  // Default props
  MySvgComponent.defaultProps = {
    width: '50px',
    height: '50px',
  };
  
  export default MySvgComponent;
  