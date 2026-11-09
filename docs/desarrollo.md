# Desarrollo de BoviControl

Los cambios se guían por criterios en specs/. El estado conserva las claves vacas, toros, crias, reprod y partos.
No se reactivan endpoints antiguos ni se cambian los intervalos reproductivos dentro de otra funcionalidad.
El código del backend y las pruebas pertenecen a roles distintos. El frontend usa datos de su cuenta y filtros sin escrituras.
La validación de API ocurre antes de persistir. Los rechazos mantienen intacto el estado anterior.
Los tests usan bases temporales. Nunca se ejecutan contra instance/ o la base remota.
static/dist se genera con npm run build y se versiona junto a los cambios de interfaz.
Cada PR adjunta el resultado de CI y la revisión de sus criterios; se corrigen hallazgos antes de integrar.
