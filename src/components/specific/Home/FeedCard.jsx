import { memo } from "react";

const FeedCard = ({ image, username, isVideo = false, avatar, onClick }) => {
    return (
    <div className="relative flex-shrink-0 p-1">
        {/* Instagram-style gradient border */}
        <div 
            className="absolute inset-0 rounded-xl p-[3px]"
            style={{
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            }}
        >
            <div className="w-full h-full bg-[#EDF6F9] rounded-xl" />
        </div>
        
        <div 
            className="relative w-[120px] h-[160px] rounded-xl overflow-hidden cursor-pointer group"
            onClick={onClick}
            style={{ zIndex: 1 }}
        >
            <img
                src={image}
                alt={username}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-200"></div>
            {isVideo && (
                <div className="absolute top-3 right-3 bg-black bg-opacity-50 rounded-full p-1.5">
                    <Play className="text-white w-3 h-3" />
                </div>
            )}
            <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center justify-center">
                <img
                    src={avatar || '/perimg.png'}
                    alt={username}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover mb-1"
                    onError={(e) => {
                        e.target.src = '/perimg.png';
                    }}
                />
                <span className="text-black text-sm font-medium drop-shadow-md">{username}</span>
            </div>
        </div>
    </div>
    )
}

export default memo(FeedCard);