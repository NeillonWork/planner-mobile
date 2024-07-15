import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Modal } from "@/components/modal";
import { linksServer } from "@/server/links-server";
import { colors } from "@/styles/colors";
import { validateInput } from "@/utils/validateInput";
import { Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, View } from "react-native";
import { TripLink, TripLinkProps } from "@/components/tripLink";
import { participantsServer } from "@/server/participants-server";
import { Participant, ParticipantProps } from "@/components/participant";

export function Details({ tripId }: { tripId: string }) {
  //MODAL
  const [showNewLinkModal, setShowNewLinkModal] = useState(false);

  //LOADING
  const [isCreatingLinkTrip, setIsCreatingLinkTrip] = useState(false);

  //LISTS
  const [links, setLinks] = useState<TripLinkProps[]>([]);
  const [participants, setParticipants] = useState<ParticipantProps[]>([]);

  //DATA
  const [linkTitle, setlinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  //CADASTRAR LINKS-DB
  async function handleCreateTripLink() {
    try {
      if (!linkTitle.trim()) {
        return Alert.alert("Link", "Informe o nome o titulo do link.");
      }

      if (!validateInput.url(linkUrl.trim())) {
        return Alert.alert("Link", "Link invalido!");
      }

      setIsCreatingLinkTrip(true);

      await linksServer.create({
        tripId,
        title: linkTitle,
        url: linkUrl,
      });

      Alert.alert("Link", "Link criado com sucesso!");
      restNewLinkFields();
      getTripLinks();
    } catch (error) {
      console.log(error);
    } finally {
      setIsCreatingLinkTrip(false);
    }
  }
  // Limpar inputs apos cadastrar um link
  function restNewLinkFields() {
    setLinkUrl("");
    setlinkTitle("");
    setShowNewLinkModal(false);
  }

  //LISTAR LINKS
  async function getTripLinks() {
    try {
      const links = await linksServer.getLinksByTripId(tripId);
      setLinks(links);
    } catch (error) {
      console.log(error);
    }
  }

  //LISTAR CONVIDADOS
  async function getTripParticipants() {
    try {
      const participants = await participantsServer.getByTripId(tripId);
      setParticipants(participants);
    } catch (error) {
      console.log(error);
    } finally {
    }
  }

  useEffect(() => {
    getTripLinks();
    getTripParticipants();
  }, []);

  return (
    <View className="flex-1 mt-10">
      <Text className="text-zinc-50 text-2xl font-semibold mb-2">
        Links importantes
      </Text>

      <View className="flex-1">
        {links.length > 0 ? (
          <FlatList
            data={links}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TripLink data={item} />}
            contentContainerClassName="gap-4"
          />
        ) : (
          <Text className="text-zinc-400 font-regular text-base mt-2 mb-6">
            Nenhum link adicionado
          </Text>
        )}

        <Button variant="secondary" onPress={() => setShowNewLinkModal(true)}>
          <Plus color={colors.zinc[200]} size={20} />
          <Button.Title>Cadastrar um novo link</Button.Title>
        </Button>
      </View>
      <View className="flex-1 border-t border-zinc-800 mt-6">
        <Text className="text-zinc-50 text-2xl font-semibold my-6">
          Convidados
        </Text>

        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Participant data={item} />}
          contentContainerClassName="gap-4 pb-44"
        />
      </View>

      <Modal
        title="Cadastrar link"
        subtitle="Todos os convidados podem cadastrar"
        visible={showNewLinkModal}
        onClose={() => setShowNewLinkModal(false)}
      >
        <View className="gap-2 mb-3">
          <Input variant="secondary">
            <Input.Field
              placeholder="Titulo do link"
              onChangeText={setlinkTitle}
            ></Input.Field>
          </Input>
          <Input variant="secondary">
            <Input.Field
              placeholder="URL"
              onChangeText={setLinkUrl}
            ></Input.Field>
          </Input>
        </View>

        <Button isLoading={isCreatingLinkTrip} onPress={handleCreateTripLink}>
          <Button.Title>Salvar link</Button.Title>
        </Button>
      </Modal>
    </View>
  );
}
