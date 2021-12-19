import { useLayoutEffect, useState } from 'react';


// Import CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Col, Container , Form, Navbar, Row } from 'react-bootstrap';

import style from "./assets/stylesheets/General.module.css"
import SignaturePad, { Options } from 'signature_pad';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from "file-saver";

import { ReactComponent as ReloadIcon } from "./assets/icons/reload.svg"

let canvas: any;
let signaturePad: any

function App() {

  const [fullName, setFullName] = useState("")
  const [place, setPlace] = useState("")

  // Get canvas
  useLayoutEffect(() => {
    canvas = document.querySelector("canvas");

    if (canvas) {
      const options: Options = {
        throttle: 0,

        minWidth: 1,
        maxWidth: 3,
        minDistance: 0
      }

      signaturePad = new SignaturePad(canvas, options);
    }
  }, [])

  // Clear Canvas
  const resetCanvas = () => {
    if (signaturePad) {
      signaturePad.clear()
    }
  }



  const generatePDF = async () => {

    console.log("v2")
 
    // Get Document
    const contractBytes = await fetch("Geheimhaltungsvereinbarung.pdf").then(res => res.arrayBuffer())

    console.log(contractBytes)

    // Load as PDFDocument
    const pdfDoc = await PDFDocument.load(contractBytes);

    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const pages = pdfDoc.getPages()
    const firstPage = pages[0]

    const { width, height } = firstPage.getSize()
    console.log(width) // Remove typescript warning

    // Add Name text
    firstPage.drawText(fullName, {
      x: 235,
      y: height - 133,
      size: 15,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    })

    // Add Place text
    const fullPlace = place + ", den 22.12.21"
    firstPage.drawText(fullPlace, {
      x: 74,
      y: 171,
      size: 11,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0)
    })


    // Add Signature to PDF
    const signatureBytes = signaturePad.toDataURL();
    let signaturePNG = await pdfDoc.embedPng(signatureBytes);
    let scaleFactor = 0.4

    firstPage.drawImage(signaturePNG, {
      x: 80,
      y: 110,
      height: signaturePNG.scale(scaleFactor).height,
      width: signaturePNG.scale(scaleFactor).width
    })


    const pdfBytes = await pdfDoc.save()

    const docUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))
    console.log(docUrl);

    saveAs(docUrl, "Vertrag.pdf")

  }

  return (
    <div className="App">
      {/* --------------------------------- Navbar --------------------------------- */}
      <Navbar className={style.Navbar}>
        <Container fluid>
          <Navbar.Brand id={style.BrandName}>Sign Fast</Navbar.Brand>
        </Container>
      </Navbar>

      <Container>
        <h1 className={style.title}>Geheimhaltungsvertrag Generator</h1>
        <h5 className={style.subheading}>
          Um am Usability Testessen von MOIRAmed teilnehmen zu können muss man ein Geheimhaltungsvertrag unterzeichnen,
          da das Patent zum aktuellen Zeitpunkt noch nicht fertig ist.
        </h5>

        <Form className={style.inputFields}>
          <Row className="mb-3">

            <Form.Group as={Col}>
              <Form.Control type="text" placeholder="Vollständiger Name" onChange={(e) => setFullName(e.target.value)} />
            </Form.Group>

            <Form.Group as={Col}>
              <Form.Control type="text" placeholder="Ort" onChange={(e) => setPlace(e.target.value)} />
            </Form.Group>


          </Row>
        </Form>


        {/* ------------------------------- Sign Stuff ------------------------------- */}
        <div className={style.signHeaderBox}>
          <h4 className={style.signHeader}>Unterschrift</h4>
          <button className={style.signResetButton} onClick={resetCanvas}>
            <ReloadIcon
              width={20}
              height={20}
              className={style.rotate}
            />
          </button>
        </div>


        <canvas id={style["signCanvas"]} width="300" height="100"></canvas>

        <Row className={`${style.centerContent} mt-4`}>
          <Col className={style.centerText}>
            <Button onClick={generatePDF} id={style.downloadBtn} >
              Vertrag Herunterladen
            </Button>
          </Col>
        </Row>

        <Row className={`${style.centerContent} mt-5`}>
          <Col xs={12}>
            <h3><a href="mailto:paulgerhard.barbu@stud.th-rosenheim.de">Send</a></h3>
            <h5 className='mt-3'>to paulgerhard.barbu@stud.th-rosenheim.de</h5>
          </Col>
        </Row>

      </Container>




    </div>
  );
}

export default App;
