import { Alert, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { TripDetails, tripServer } from "@/server/trip-server";
import Loading from "@/components/loading";
import { Input } from "@/components/input";
import {
  CalendarRange,
  Info,
  MapPin,
  Settings2,
  Calendar as IconCalendar,
} from "lucide-react-native";
import { colors } from "@/styles/colors";
import dayjs from "dayjs";
import { Button } from "@/components/button";
//import { Activity } from "@/components/activity";
import { Details } from "./details";
import { Activities } from "./activities";
import { Modal } from "@/components/modal";
import { Calendar } from "@/components/calendar";
import { DateData } from "react-native-calendars";
import { calendarUtils, DatesSelected } from "@/utils/calendarUtils";
import { validateInput } from "@/utils/validateInput";
import { participantsServer } from "@/server/participants-server";
import { tripStorage } from "@/storage/trip";

export type TripData = TripDetails & { when: string };

enum MODAL {
  NONE = 0,
  UPDATE_TRIP = 2,
  CALENDARIO = 3,
  CONFIRM_ATTENDANCE = 3,
}

export default function Trip() {
  //LOADING
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [isUpdateTrip, setIsUpdateTrip] = useState(false);
  const [isConfirmingAttendance, setIsConfirmingAttendance] = useState(true);

  //MODAL
  const [showModal, setShowModal] = useState(MODAL.NONE);

  //DATA
  const [tripDatails, setTripDatails] = useState({} as TripData);
  const [option, setOption] = useState<"activity" | "details">("activity");
  const [destination, setDestination] = useState("");
  const [selectedDates, setSelectedDates] = useState({} as DatesSelected);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const tripParams = useLocalSearchParams<{
    id: string;
    participant?: string;
  }>();

  async function getTripDetails() {
    try {
      setIsLoadingTrip(true);

      if (!tripParams.id) {
        return router.back();
      }

      const trip = await tripServer.getById(tripParams.id);

      const maxLenghtDestination = 14;
      const destination =
        trip.destination.length > maxLenghtDestination
          ? trip.destination.slice(0, maxLenghtDestination) + "..."
          : trip.destination;

      const starts_at = dayjs(trip.starts_at).format("DD");
      const ends_at = dayjs(trip.ends_at).format("DD");
      const month = dayjs(trip.starts_at).format("MMMM");

      setDestination(trip.destination);

      setTripDatails({
        ...trip,
        when: `${destination} de ${starts_at} a ${ends_at} de ${month}.`,
      });

      console.log(trip);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingTrip(false);
    }
  }

  async function handleUpdateTrip() {
    try {
      if (!tripParams.id) {
        return;
      }

      if (!destination || !selectedDates.startsAt || !selectedDates.endsAt) {
        return Alert.alert(
          "Atualizar viagem",
          "Lembre-se de , alem de preencher o destino, selecione data de inicio e fim da viagem."
        );
      }
      setIsLoadingTrip(true);

      await tripServer.update({
        id: tripParams.id,
        destination: destination,
        starts_at: dayjs(selectedDates.startsAt.dateString).toString(),
        ends_at: dayjs(selectedDates.endsAt.dateString).toString(),
      });
      Alert.alert("Atualizar viagem", "Viagem atualizada com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            setShowModal(MODAL.NONE);
            getTripDetails();
          },
        },
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsUpdateTrip(false);
    }
  }

  useEffect(() => {
    getTripDetails();
  }, []);

  if (isLoadingTrip) {
    return <Loading />;
  }

  function handleSelectDate(selectedDay: DateData) {
    const dates = calendarUtils.orderStartsAtAndEndsAt({
      startsAt: selectedDates.startsAt,
      endsAt: selectedDates.endsAt,
      selectedDay,
    });

    setSelectedDates(dates);
  }

  async function handleConfirmAttendance() {
    try {
      
      if (!tripParams.id || !tripParams.participant) {
        return;
      }
        
      if (!guestName.trim() || !guestEmail.trim()) {
        Alert.alert(
          "Confirmação",
          "Preencha nome e e-mail para confirmar a viagem!"
        );
      }

      if (!validateInput.email(guestEmail.trim())) {
        Alert.alert("Confirmação", "E-mail invalido");
      }

      await participantsServer.confirmTripByParticipantId({
        //  participantId: tripParams.participant,
        participantId: tripParams.participant,
        name: guestName,
        email: guestEmail.trim(),
      });

      Alert.alert("Confirmação", "Viagem confirmada com sucesso!");
      await tripStorage.save(tripParams.id);
      
      setShowModal(MODAL.NONE);
    } catch (error) {
      console.log(error);
      Alert.alert("Confirmação", "Erro ao confirmar viagem");
    }
  }

  return (
    <View className="flex-1 px-5 pt-16">
      <Input variant="tertiary">
        <MapPin color={colors.zinc[400]} size={20} />
        <Input.Field value={tripDatails.when} readOnly></Input.Field>

        <View className="w-9 h-9 bg-zinc-800 justify-center items-center rounded">
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => setShowModal(MODAL.UPDATE_TRIP)}
          >
            <Settings2 color={colors.zinc[400]} size={20} />
          </TouchableOpacity>
        </View>
      </Input>

      {option === "activity" ? (
        <Activities tripDetails={tripDatails} />
      ) : (
        <Details tripId={tripDatails.id} />
      )}

      <View className="w-full absolute -bottom-1 self-center justify-end pb-5 z-10 bg-zinc-950">
        <View className="flex-row bg-zinc-900 p-4 rounded-lg border border-zinc-800 gap-2">
          <View className="w-1/2">
            <Button
              onPress={() => setOption("activity")}
              variant={option === "activity" ? "primary" : "secondary"}
            >
              <CalendarRange
                color={
                  option === "activity" ? colors.lime[950] : colors.zinc[200]
                }
                size={20}
              />

              <Button.Title>Atividades</Button.Title>
            </Button>
          </View>
          <View className="w-1/2">
            <Button
              onPress={() => setOption("details")}
              variant={option === "details" ? "primary" : "secondary"}
            >
              <Info
                color={
                  option === "details" ? colors.lime[950] : colors.zinc[200]
                }
                size={20}
              />
              <Button.Title>Detalhes</Button.Title>
            </Button>
          </View>
        </View>
      </View>

      <Modal
        title="Atualizar viagem"
        subtitle="Somente quem criou a viagem pode editar."
        visible={showModal === MODAL.UPDATE_TRIP}
        onClose={() => setShowModal(MODAL.NONE)}
      >
        <View className="gap-2 my-4">
          <Input variant="secondary">
            <MapPin color={colors.zinc[400]} size={20} />
            <Input.Field
              placeholder="Para onde?"
              onChangeText={setDestination}
              value={destination}
            />
          </Input>

          <Input variant="secondary">
            <IconCalendar color={colors.zinc[400]} size={20} />

            <Input.Field
              placeholder="Quando?"
              value={selectedDates.formatDatesInText}
              onPressIn={() => setShowModal(MODAL.CALENDARIO)}
              onFocus={() => Keyboard.dismiss()}
            />
          </Input>

          <Button
            className="my-2"
            onPress={handleUpdateTrip}
            isLoading={isUpdateTrip}
          >
            <Button.Title>Atualizar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Selecionar datas"
        subtitle="Selecione a data de ida e volta da viagem"
        visible={showModal === MODAL.CALENDARIO}
        onClose={() => {
          setShowModal(MODAL.NONE);
        }}
      >
        <View className="gap-4 mt-4">
          <Calendar
            minDate={dayjs().toISOString()}
            onDayPress={handleSelectDate}
            markedDates={selectedDates.dates}
          />

          <Button onPress={() => setShowModal(MODAL.UPDATE_TRIP)}>
            <Button.Title>Confirmar</Button.Title>
          </Button>
        </View>
      </Modal>

      <Modal
        title="Confirmar presença"
        visible={showModal === MODAL.CONFIRM_ATTENDANCE}
      >
        <View className="gap-4 mt-4">
          <Text className="text-zinc-400 font-regular leading-6 my-2">
            Você foi convidado(a) para participar de uma viagem para{" "}
            <Text className="font-semibold text-lime-100">
              {tripDatails.destination}
            </Text>{" "}
            nas datas de{" "}
            <Text className="font-semibold text-lime-100">
              {dayjs(tripDatails.starts_at).date()} até{" "}
              {dayjs(tripDatails.ends_at).date()} de{" "}
              {dayjs(tripDatails.ends_at).format("MMMM")} . {"\n\n"}
            </Text>
            Para confirmar sua presença na viagem, preencha os dados abaixo:
          </Text>

          <Input variant="secondary">
            <Input.Field
              placeholder="Seu nome completo"
              onChangeText={setGuestName}
            />
          </Input>

          <Input variant="secondary">
            <Input.Field
              placeholder="E-mail de confirmação"
              onChangeText={setGuestEmail}
            />
          </Input>

          <Button
            //  isLoading={IsConfirmingAttendance}
            onPress={handleConfirmAttendance}
          >
            <Button.Title>Confirmar minha presença</Button.Title>
          </Button>
        </View>
      </Modal>
    </View>
  );
}
