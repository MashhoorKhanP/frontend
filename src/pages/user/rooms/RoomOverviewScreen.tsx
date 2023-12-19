import React, { forwardRef, useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  Divider,
  IconButton,
  Rating,
  Slide,
  SlideProps,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Close, StarBorder } from "@mui/icons-material";
import {
  Autoplay,
  Pagination,
  Lazy,
  Navigation,
  Zoom,
  EffectCreative,
} from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/lazy";
import "swiper/css/zoom";
import "./swiper.css";
import "./bookRoom.css";
import { WanderLuxeLogo } from "../../../assets/extraImages";
import { HotelDetails } from "../../../store/slices/adminSlices/adminSlice";
import {
  closeRoomOverview,
  setAdditionalRoomsNeeded,
  setRoomId,
} from "../../../store/slices/userSlices/roomSlice";
import Swal from "sweetalert2";
import { AppDispatch } from "../../../store/store";

interface Place {
  text: string;
  place_name: string;
}

const Transition = forwardRef<HTMLDivElement, SlideProps>((props, ref) => {
  const transitionSpeed = 500;

  return (
    <Slide
      direction="down"
      {...props}
      ref={ref}
      timeout={{ enter: transitionSpeed, exit: transitionSpeed }}
    />
  );
});

const RoomOverviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const isOpen = useSelector(
    (state: RootState) => state.room.isRoomOverviewOpen
  );
  const roomId = useSelector((state: RootState) => state.room.selectedRoomId);
  const rooms: any = useSelector(
    (state: RootState) => state.user.filteredRooms
  );
  const hotels = useSelector((state: RootState) => state.user.filteredHotels);
  const checkInCheckoutRange: any = useSelector(
    (state: RootState) => state.room.checkInCheckOutRange
  );
  const adultChildCount = useSelector((state: RootState) => state.room.adultChildrenCount);
  const additionalRoomsNeeded = useSelector((state: RootState) => state.room.additionalRoomsNeeded);
  
  console.log("checkInCheckout", checkInCheckoutRange);
  const [room, setRoom] = useState<any>([]);
  const [hotel, setHotel] = useState<any>([]);
  const [place, setPlace] = useState<Place | null>(null);
  const [roomsNeeded, setRoomsNeeded] = useState<number>(additionalRoomsNeeded? additionalRoomsNeeded:1);

  useEffect(() => {
    if (isOpen && roomId) {
      // Use useEffect to update room only after the component has mounted
      const roomDetails = rooms.find((room: any) => room._id === roomId);
      setRoom(roomDetails);

      // Ensure hotel is defined before attempting to access its properties
      const selectedHotel = hotels.find(
        (selectedHotel: HotelDetails) =>
          selectedHotel._id === roomDetails?.hotelId
      );

      if (selectedHotel) {
        setHotel(selectedHotel);

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${
          selectedHotel.longitude
        },${selectedHotel.latitude}.json?access_token=${
          import.meta.env.VITE_MAPBOX_TOKEN
        }`;

        fetch(url)
          .then((response) => response.json())
          .then((data) => setPlace(data.features[0]));
      }
    }
   

      
  }, [roomId, isOpen, rooms, hotels, room]);

  useEffect(() => {
    const totalPeople = adultChildCount ? adultChildCount : 1;
    const additionalRoomsNeeded = Math.max(
      Math.ceil((totalPeople - room.maxPeople) / room.maxPeople),
      0
    );
  
    setRoomsNeeded(additionalRoomsNeeded);
    dispatch(setAdditionalRoomsNeeded(additionalRoomsNeeded));
  }, [adultChildCount, room]);
  

  const handleClose = () => {
    dispatch(closeRoomOverview());
    
    dispatch(setRoomId(""));
    // setHotel([]);
    // Dispatch an action to close the RoomOverviewScreen
    // navigate('/user/view-rooms');
  };
  console.log('adultChildrencount',adultChildCount)
  console.log('roomsNeeded',roomsNeeded)
  const handleBooking = () => {
      dispatch(closeRoomOverview());
      Swal.fire({
        title: "Are you sure?",
        text: `Book ${room.roomType} on ${
          room.hotelName
        } hotel! (Check-In: ${checkInCheckoutRange.startDate.toDateString()} ${
          checkInCheckoutRange.startTime
        } & Check-Out: ${checkInCheckoutRange.endDate.toDateString()} ${
          checkInCheckoutRange.endTime
        })`,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Yes, Book",
        confirmButtonColor: "green",
        cancelButtonText: "No, cancel!",
        customClass: {
          container: "custom-swal-container",
        },
        width: 450,
        background: "#f0f0f0",
        iconHtml: '<i class="bi bi-check-lg" style="font-size:55px"></i>',
      }).then(async (result) => {
        if (result.isConfirmed) {
          navigate(`/user/book-room?roomId=${roomId}&additionalroomsNeeded=${roomsNeeded}`);
        }
      });
    
  };

  console.log("Room from overview", room);
  console.log("Hotel from overview", hotel);
  return (
    <Dialog
      className="dialog_container"
      open={isOpen && location.pathname === "/user/view-rooms"}
      onClose={(event, reason) => {
        if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
          // Set 'open' to false, however you would do that with your particular code.
          handleClose;
        }
      }}
      TransitionComponent={Transition}
    >
      <Container>
        <Toolbar sx={{ paddingTop: 2, paddingBottom: 2 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Typography variant="h6">{room.roomType}</Typography>
            <Typography variant="subtitle2">{room.hotelName}</Typography>
          </div>
          <IconButton color="inherit" onClick={handleClose}>
            <Close />
          </IconButton>
        </Toolbar>
        <Divider
          sx={{
            width: "100%",
            height: "1px",
            bgcolor: "#777",
          }}
        />
        <br />
        <Swiper
          className="swiper-container"
          style={
            {
              "--swiper-navigation-color": "#fff",
              "--swiper-pagination-color": "#fff",
            } as React.CSSProperties
          }
          modules={[
            Navigation,
            Autoplay,
            EffectCreative,
            Lazy,
            Zoom,
            Pagination,
          ]}
          centeredSlides={true}
          slidesPerView={1}
          grabCursor={true}
          navigation={true}
          pagination={{
            clickable: true,
          }}
          autoplay={{
            delay: 2000, // Set the delay between transitions
            disableOnInteraction: true,
          }}
          speed={1000}
          lazy={true}
          zoom={true}
          effect="creative"
          creativeEffect={{
            prev: {
              shadow: true,
              translate: [0, 0, -400],
            },
            next: {
              translate: ["100%", 0, 0],
            },
          }}
        >
          {room?.images?.map((url: string) => (
            <SwiperSlide key={url}>
              <div className="swiper-zoom-container">
                <img src={url} alt="room" />
              </div>
            </SwiperSlide>
          ))}
          <Tooltip
            title={room.hotelName || ""}
            sx={{
              position: "absolute",
              bottom: "8px",
              left: "8px",
              zIndex: 4000,
            }}
          >
            <Avatar src={WanderLuxeLogo} />
          </Tooltip>
        </Swiper>
        <Stack
          sx={{ p: 2 }}
          spacing={2}
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Stack direction="row" p={0}>
           
           <Typography
             variant="h6"
             sx={{ fontSize: "12px", color: "#666" }}
           >
             {`₹ = 1 room x ${checkInCheckoutRange.numberOfNights} night`}
           </Typography>
       </Stack>
          <Stack direction="row">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "75%",
                }}
              >
                
                <Box>
                  <Typography
                    variant="h6"
                    component={"span"}
                    sx={{ fontSize: "26px" }}
                  >
                    {checkInCheckoutRange.numberOfNights
                      ? `₹${room.price * checkInCheckoutRange.numberOfNights}`
                      : `₹${room.price}`}
                  </Typography>
                  <Typography
                    variant="h6"
                    component={"span"}
                    style={{
                      textDecoration: "line-through",
                      fontSize: "16px",
                      color: "#777",
                    }}
                  >
                    {checkInCheckoutRange.numberOfNights
                      ? `₹${
                          (room.price + room.discountPrice) *
                          checkInCheckoutRange.numberOfNights
                        }`
                      : `₹${room.price + room.discountPrice}`}
                  </Typography>
                  
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    component={"span"}
                    style={{ fontSize: "15px", color: "GrayText" }}
                  >
                    {"Ratings:"}
                  </Typography>
                  <Rating
                    name="room-rating"
                    defaultValue={3.5}
                    precision={0.5}
                    emptyIcon={<StarBorder sx={{ color: "#777" }} />}
                  />
                </Box>
              </Box>
            </Box>
          </Stack>
          
          <Stack direction="row">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                }}
              >
                <Typography
                  variant="h6"
                  component={"span"}
                  sx={{ fontSize: "16px", pr: 0.5, color: "#666" }}
                >
                  Amenities:
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {room.amenities &&
                  room.amenities.map((amenity: string, index: number) => (
                    <>
                      <Typography
                        variant="h6"
                        sx={{ fontSize: "14px" }}
                        key={index}
                      >
                        {`${amenity} `}
                      </Typography>
                      {index >= 0 && index < room.amenities.length - 1 ? (
                        <Typography
                          sx={{ pl: 0.5, pr: 0.5, fontSize: "14px" }}
                          variant="h6"
                        >
                          •
                        </Typography>
                      ) : (
                        ""
                      )}
                    </>
                  ))}
              </Box>
            </Box>
          </Stack>
          <Stack direction="row">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Typography
                variant="h6"
                component={"span"}
                sx={{ fontSize: "16px", pr: 0.5, color: "#666" }}
              >
                Max People:
              </Typography>
              <Typography
                variant="h6"
                component={"span"}
                sx={{ fontSize: "14px" }}
              >
                {room.maxPeople}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Typography
                variant="h6"
                component={"span"}
                sx={{ fontSize: "16px", pr: 0.5, color: "#666" }}
              >
                Rooms Available:
              </Typography>
              <Typography
                variant="h6"
                component={"span"}
                sx={{ fontSize: "14px" }}
              >
                {room.roomsCount}
              </Typography>
            </Box>
          </Stack>
          <Stack>
            <Box
              sx={{
                display: "inline-block",
              }}
            >
              <Typography
                variant="h6"
                component={"span"}
                sx={{ fontSize: "16px", pr: 0.5, color: "#666" }}
              >
                {"Address: "}
              </Typography>
              <br />
              <Typography
                variant="h6"
                component={"span"}
                sx={{ fontSize: "14px" }}
              >
                {place?.place_name || hotel?.location}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "inline-block",
              }}
            >
              <Typography
                variant="h6"
                component={"span"}
                sx={{ fontSize: "16px", color: "#666" }}
              >
                {"Location: "}
              </Typography>
              <br />
              <Typography
                variant="h6"
                component={"span"}
                sx={{ fontSize: "14px" }}
              >
                {place?.text + ", " + hotel?.location || hotel?.location}
              </Typography>
            </Box>
          </Stack>

          <Stack>
            <Typography
              variant="h6"
              component={"span"}
              sx={{ fontSize: "16px", pr: 0.5, color: "#666" }}
            >
              {"Description: "}
            </Typography>
            <Typography
              variant="h6"
              component={"span"}
              sx={{ fontSize: "14px" }}
            >
              {room.description}
            </Typography>
          </Stack>
          <Stack direction="row" width={"100%"}>
  {checkInCheckoutRange &&
    (checkInCheckoutRange.startDate.toLocaleDateString() ===
      checkInCheckoutRange.endDate.toLocaleDateString() ||
    checkInCheckoutRange.startDate === undefined ||
    checkInCheckoutRange.endDate === undefined ||
    checkInCheckoutRange.startTime === undefined ||
    checkInCheckoutRange.endTime === undefined ? (
      <Button
        variant="outlined"
        onClick={handleClose}
        sx={{
          width: "100%",
          p: 1,
          borderRadius: 0,
          borderColor: "red",
          color: "red",
          "&:hover": {
            border: "1.5px solid red",
            borderColor: "red",
          },
        }}
      >
        Select a valid CheckIn/CheckOut to proceed!
      </Button>
    ) : (
      <Button
        className="book_room_btn"
        variant="outlined"
        sx={{ width: "100%", p: 1, borderRadius: 0 }}
        color="inherit"
        disabled={room.roomsCount <= roomsNeeded} // Disable button if rooms are not available
        onClick={handleBooking}
      >
        {room.roomsCount > roomsNeeded ? (
          <span>Book room</span>
        ) : (
          <span>Room availability exceeded</span>
        )}
      </Button>
    ))}
</Stack>
        </Stack>
      </Container>
    </Dialog>
  );
};

export default RoomOverviewScreen;
