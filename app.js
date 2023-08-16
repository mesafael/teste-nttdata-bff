const express = require('express')
const cors = require('cors')
const fs = require('fs')
const { log, count } = require('console')
const app = express()

app.use(express.json())
app.use(
    cors({
        origin: 'http://localhost:3001',
        // Allow follow-up middleware to override this CORS for options
        preflightContinue: true,
    }),
);

app.post('/producer/add', (req, res) => {

    const existProducers = getProducerData()

    const producerData = req.body
    if (producerData.cpf == null) {
        return res.status(401).send({ error: true, msg: 'Producer data missing' })
    }

    const findExist = existProducers.find(producer => producer.cpf === producerData.cpf)
    if (findExist) {
        return res.status(409).send({ error: true, msg: 'CPF ou CPNJ já existem!' })
    }

    existProducers.push(producerData)

    saveProducerData(existProducers);
    res.send({ success: true, msg: 'Produtor adicionados com sucesso' })
})

app.get('/producer/get', (req, res) => {
    const producers = getProducerData()
    res.send(producers)
})

app.patch('/producer/update', (req, res) => {
    const cpf = req.body.cpf
    const uproducerData = req.body
    const existProducer = getProducerData()
    const findExist = existProducer.find(producer => producer.cpf === cpf)

    if (!findExist) {
        return res.status(409).send({ error: true, msg: 'Produtor não esta cadastrado!' })
    }

    const updateProducer = existProducer.filter(producer => producer.cpf !== cpf)

    updateProducer.push(uproducerData)
    saveProducerData(updateProducer)
    res.send({ success: true, msg: 'Producer data updated successfully' })
})

app.delete('/producer/delete/:cpf', (req, res) => {
    const cpf = req.params.cpf
    const existProducers = getProducerData()
    const filterProducer = existProducers.filter(producer => producer.cpf !== cpf)
    if (existProducers.length === filterProducer.length) {
        return res.status(409).send({ error: true, msg: 'cpf does not exist' })
    }
    saveProducerData(filterProducer)
    res.send({ success: true, msg: 'Producer removed successfully' })
})

app.get('/producer/culture/get', (req, res) => {
    const producers = getProducerData()
    const objCulture = {
        cafe: 0,
        algodao: 0,
        milho: 0,
        soja: 0,
        cana: 0,
        total: 0
    }
    for (let p = 0; p < producers.length; p++) {
        for (let c = 0; c < producers[p].culture.length; c++) {
            objCulture.total++

            switch (producers[p].culture[c]) {
                case 'cafe':
                    objCulture.cafe = objCulture.cafe + 1
                    break;
                case 'algodao':
                    objCulture.algodao = objCulture.algodao + 1
                    break;
                case 'milho':
                    objCulture.milho = objCulture.milho + 1
                    break;
                case 'cana':
                    objCulture.milho = objCulture.milho + 1
                    break;
                case 'soja':
                    objCulture.milho = objCulture.milho + 1
                    break;

                default:
                    break;
            }

        }
    }
    res.send(objCulture)
})

app.get('/producer/agriveg/get', (req, res) => {
    const producers = getProducerData()
    const objAgriVeg = {
        agricultavel: 0,
        vegetacao: 0
    }
    for (let p = 0; p < producers.length; p++) {
        if(!!producers[p].totalAgriHectares || !!producers[p].totalVegHectares){
            objAgriVeg.agricultavel = objAgriVeg.agricultavel + Number(producers[p].totalAgriHectares);
            objAgriVeg.vegetacao = objAgriVeg.vegetacao + Number(producers[p].totalVegHectares);
        }
       
      
        //   
    }
    console.log(objAgriVeg);
    res.send(objAgriVeg)
})

app.get('/producer/state/get', (req, res) => {
    const producers = getProducerData()
    const objState = []
    const labelCounts = {};

    for (const p in producers) {
        const state = producers[p].state

        objState.push({ y: 1, label: state })
    }

    objState.forEach(item => {
        if (labelCounts[item.label]) {
            labelCounts[item.label] += item.y;
        } else {
            labelCounts[item.label] = item.y;
        }
    });

    const aggregatedData = Object.keys(labelCounts).map(label => ({
        y: labelCounts[label],
        label: label
    }));

    res.send(aggregatedData)
})


const getProducerData = () => {
    const jsonData = fs.readFileSync('producer.json')
    return JSON.parse(jsonData)
}

const saveProducerData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('producer.json', stringifyData)
}

//configure the server port
app.listen(3000, () => {
    console.log('Server runs on port 3000')
})