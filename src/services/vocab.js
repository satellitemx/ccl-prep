import axios from "axios"

const getVocab = async () => {
    return axios
        .get("./assets/vocab.json")
        .then(response => response.data)
}

export default getVocab