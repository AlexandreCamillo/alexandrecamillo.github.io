const rVotoPara = document.querySelector('.esquerda .rotulo.r1 span')
const rCargo = document.querySelector('.esquerda .rotulo.r2 span')
const numeros = document.querySelector('.esquerda .rotulo.r3')
const rDescricao = document.querySelector('.esquerda .rotulo.r4')
const rMensagem = document.querySelector('.esquerda .rotulo.r4 .mensagem')
const rNomeCandidato = document.querySelector('.esquerda .rotulo.r4 .nome-candidato')
const rPartidoPolitico = document.querySelector('.esquerda .rotulo.r4 .partido-politico')
const rNomeVice = document.querySelector('.esquerda .rotulo.r4 .nome-vice')
const rRodape = document.querySelector('.tela .rodape')

const rCandidato = document.querySelector('.direita .candidato')
const rVice = document.querySelector('.direita .candidato.menor')

const votos = []

var etapaAtual = 0
var etapas = null
var numeroDigitado = ''
var votoEmBranco = false

ajax('https://trab-final.herokuapp.com/stages', 'GET', (response) => {
// ajax('http://localhost:8000/stages', 'GET', (response) => {
  etapas = JSON.parse(response).data.reduce((acc, e) => {acc[e.id] = e; return acc;}, {})

  comecarEtapa()
})

window.onload = () => {
  let btns = document.querySelectorAll('.teclado--botao')
  for (let btn of btns) {
    btn.onclick = () => {
      clicar(btn.innerHTML)
    }
  }

  document.querySelector('.teclado--botao.branco').onclick = () => branco()
  document.querySelector('.teclado--botao.laranja').onclick = () => corrigir()
  document.querySelector('.teclado--botao.verde').onclick = () => confirmar()
}

/**
 * Inicia a etapa atual.
 */
function comecarEtapa() {
  let etapa = etapas[etapaAtual]
  console.log('Etapa atual: ' + etapa['title'])

  numeroDigitado = ''
  votoEmBranco = false

  numeros.style.display = 'flex'
  numeros.innerHTML = ''
  rVotoPara.style.display = 'none'
  rCandidato.style.display = 'none'
  rVice.style.display = 'none'
  rDescricao.style.display = 'none'
  rMensagem.style.display = 'none'
  rNomeCandidato.style.display = 'none'
  rPartidoPolitico.style.display = 'none'
  rNomeVice.style.display = 'none'
  rRodape.style.display = 'none'

  for (let i = 0; i < etapa['numbers_length']; i++) {
    let pisca = i == 0 ? ' pisca' : ''
    numeros.innerHTML += `
      <div class="numero${pisca}"></div>
    `
  }

  rCargo.innerHTML = etapa['title']
}

/**
 * Procura o candidato pelo número digitado,
 * se encontrar, mostra os dados dele na tela.
 */
function atualizarInterface() {
  console.log('Número Digitado:', numeroDigitado)

  let etapa = etapas[etapaAtual]
  let candidato = null

  
  let candidatos = Array.isArray(etapa['candidates']) ? etapa['candidates'] : Object.values(etapa['candidates'])
  candidato  = candidatos.find((c) => c.id == numeroDigitado);

  console.log('Candidato: ' + candidato)

  rVotoPara.style.display = 'inline'
  rDescricao.style.display = 'block'
  rNomeCandidato.style.display = 'block'
  rPartidoPolitico.style.display = 'block'

  if (candidato) {
    let vice = JSON.parse(candidato['vice'])

    rRodape.style.display = 'block'
    rNomeCandidato.querySelector('span').innerHTML = candidato['name']
    rPartidoPolitico.querySelector('span').innerHTML = candidato['party']

    rCandidato.style.display = 'block'
    rCandidato.querySelector('.imagem img').src = `img/${candidato['image']}`
    rCandidato.querySelector('.cargo p').innerHTML = etapa['title']
    
    if (vice) {
      rNomeVice.style.display = 'block'
      rNomeVice.querySelector('span').innerHTML = vice['nome']
      rVice.style.display = 'block'
      rVice.querySelector('.imagem img').src = `img/${vice['foto']}`
    } else {
      rNomeVice.style.display = 'none'
    }

    return
  }

  if (votoEmBranco) return

  // Anular o voto
  rNomeCandidato.style.display = 'none'
  rPartidoPolitico.style.display = 'none'
  rNomeVice.style.display = 'none'

  rMensagem.style.display = 'block'
  rMensagem.classList.add('pisca')
  rMensagem.innerHTML = 'VOTO NULO'
}

/**
 * Verifica se pode usar o teclado e atualiza o número.
 */
function clicar(value) {
  console.log(value)

  let elNum = document.querySelector('.esquerda .rotulo.r3 .numero.pisca')
  if (elNum && ! votoEmBranco) {
    numeroDigitado += (value)
    elNum.innerHTML = value
    elNum.classList.remove('pisca')

    let proximoNumero = elNum.nextElementSibling
    if (proximoNumero) {
      proximoNumero.classList.add('pisca')
    } else {
      atualizarInterface()
    }

    (new Audio('audio/se1.mp3')).play()
  }
}

/**
 * Verifica se há número digitado, se não,
 * vota em branco.
 */
function branco() {
  console.log('branco')
  
  // Verifica se há algum número digitado,
  // se sim, não vota
  if (! numeroDigitado) {
    votoEmBranco = true

    numeros.style.display = 'none'
    rVotoPara.style.display = 'inline'
    rDescricao.style.display = 'block'
    rMensagem.style.display = 'block'
    rMensagem.innerHTML = 'VOTO EM BRANCO';

    (new Audio('audio/se1.mp3')).play()
  }

}

/**
 * Reinicia a etapa atual.
 */
function corrigir() {
  console.log('corrigir');
  (new Audio('audio/se2.mp3')).play()
  comecarEtapa()
}

/**
 * Confirma o numero selecionado.
 */
function confirmar() {
  console.log('confirmar')

  let etapa = etapas[etapaAtual]

  let candidatos = Array.isArray(etapa['candidates']) ? etapa['candidates'] : Object.values(etapa['candidates'])
  candidato  = candidatos.find((c) => c.id == numeroDigitado);

  if (numeroDigitado.length == etapa['numbers_length']) {
    if (candidato) {
      // Votou em candidato
      votos.push({
        'etapa': etapa['title'],
        'numero': numeroDigitado
      })
      console.log(`Votou em ${numeroDigitado}`)
    } else {
      // Votou nulo
      votos.push({
        'etapa': etapa['title'],
        'numero': null
      })
      console.log('Votou Nulo')
    }
  } else if (votoEmBranco) {
    // Votou em branco
      votos.push({
        'etapa': etapa['title'],
        'numero': ''
      })
      console.log('Votou em Branco')
  } else {
    // Voto não pode ser confirmado
    console.log('Voto não pode ser confirmado')
    return
  }

  if (etapas[etapaAtual + 1]) {
    etapaAtual++
  } else {
    document.querySelector('.tela').innerHTML = `
      <div class="fim">FIM</div>
    `
  }

  (new Audio('audio/se3.mp3')).play()
  comecarEtapa()
}